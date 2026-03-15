import { query } from '/opt/nodejs/db.mjs';
import { getUserSub, getUserEmail } from '/opt/nodejs/auth.mjs';
import { ok, created, badRequest, notFound, serverError } from '/opt/nodejs/response.mjs';

async function ensureUser(sub, email) {
  const { rows } = await query(
    `INSERT INTO users (cognito_sub, email) VALUES ($1, $2)
     ON CONFLICT (cognito_sub) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [sub, email]
  );
  return rows[0].id;
}

async function createEntry(event) {
  const sub = getUserSub(event);
  const email = getUserEmail(event);
  const userId = await ensureUser(sub, email);
  const body = JSON.parse(event.body);

  if (!Array.isArray(body.emotionIds) || !body.emotionIds.length || !body.intensity) {
    return badRequest('emotionIds (array) and intensity are required');
  }
  if (body.intensity < 1 || body.intensity > 5) {
    return badRequest('intensity must be between 1 and 5');
  }

  const { rows } = await query(
    `INSERT INTO emotion_entries (user_id, emotion_ids, intensity, context_tag, note)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, body.emotionIds, body.intensity, body.contextTag || null, body.note || null]
  );

  return created({ ...rows[0], userId });
}

async function listEntries(event) {
  const sub = getUserSub(event);
  const params = event.queryStringParameters || {};
  const rawLimit = parseInt(params.limit || '20') || 20;
  const limit = rawLimit > 1000 ? 1000 : rawLimit; // cap at 1000 for safety
  const offset = parseInt(params.offset || '0') || 0;

  const { rows } = await query(
    `SELECT DISTINCT ON (e.id) e.*, a.id as ai_response_id, a.understanding, a.structure, a.suggestion, a.question
     FROM emotion_entries e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN ai_responses a ON a.entry_id = e.id
     WHERE u.cognito_sub = $1 AND u.deleted_at IS NULL
     ORDER BY e.id, a.created_at DESC`,
    [sub]
  );
  // Sort by recorded_at DESC and apply pagination
  rows.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  const paginated = rows.slice(offset, offset + limit);

  return ok(paginated);
}

async function getEntry(event) {
  const sub = getUserSub(event);
  const entryId = event.pathParameters.id;

  const { rows } = await query(
    `SELECT e.*, a.id as ai_response_id, a.understanding, a.structure, a.suggestion, a.question
     FROM emotion_entries e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN ai_responses a ON a.entry_id = e.id
     WHERE u.cognito_sub = $1 AND e.id = $2 AND u.deleted_at IS NULL
     ORDER BY a.created_at DESC LIMIT 1`,
    [sub, entryId]
  );

  if (!rows.length) return notFound('Entry not found');
  return ok(rows[0]);
}

async function updateEntry(event) {
  const sub = getUserSub(event);
  const email = getUserEmail(event);
  const userId = await ensureUser(sub, email);
  const entryId = event.pathParameters.id;
  const body = JSON.parse(event.body);

  // Validate ownership
  const { rows: existing } = await query(
    'SELECT id FROM emotion_entries WHERE id = $1 AND user_id = $2',
    [entryId, userId]
  );
  if (!existing.length) return notFound('Entry not found');

  const sets = [];
  const values = [entryId, userId];
  let idx = 3;

  if (body.emotionIds) {
    sets.push(`emotion_ids = $${idx}`);
    values.push(body.emotionIds);
    idx++;
  }
  if (body.intensity) {
    sets.push(`intensity = $${idx}`);
    values.push(body.intensity);
    idx++;
  }
  if (body.contextTag !== undefined) {
    sets.push(`context_tag = $${idx}`);
    values.push(body.contextTag || null);
    idx++;
  }
  if (body.note !== undefined) {
    sets.push(`note = $${idx}`);
    values.push(body.note || null);
    idx++;
  }

  if (!sets.length) return badRequest('No fields to update');

  const { rows } = await query(
    `UPDATE emotion_entries SET ${sets.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`,
    values
  );

  // Delete old AI response since entry changed
  await query('DELETE FROM ai_responses WHERE entry_id = $1', [entryId]);

  return ok(rows[0]);
}

async function deleteEntry(event) {
  const sub = getUserSub(event);
  const entryId = event.pathParameters?.id;
  if (!entryId) return badRequest('Entry ID is required');

  const result = await query(
    `DELETE FROM emotion_entries e
     USING users u
     WHERE u.id = e.user_id AND u.cognito_sub = $1 AND e.id = $2`,
    [sub, entryId]
  );

  if (result.rowCount === 0) return notFound('Entry not found');
  return ok({ deleted: true });
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});

    switch (event.httpMethod) {
      case 'POST': return await createEntry(event);
      case 'GET':
        return event.pathParameters?.id
          ? await getEntry(event)
          : await listEntries(event);
      case 'DELETE': return await deleteEntry(event);
      case 'PUT': return await updateEntry(event);
      default: return badRequest('Method not allowed');
    }
  } catch (err) {
    return serverError(err);
  }
}
