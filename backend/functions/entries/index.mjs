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

  if (!body.emotionIds?.length || !body.intensity) {
    return badRequest('emotionIds and intensity are required');
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
  const limit = Math.min(parseInt(params.limit || '20'), 50);
  const offset = parseInt(params.offset || '0');

  const { rows } = await query(
    `SELECT e.*, a.understanding, a.structure, a.suggestion, a.question
     FROM emotion_entries e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN ai_responses a ON a.entry_id = e.id
     WHERE u.cognito_sub = $1
     ORDER BY e.recorded_at DESC
     LIMIT $2 OFFSET $3`,
    [sub, limit, offset]
  );

  return ok(rows);
}

async function getEntry(event) {
  const sub = getUserSub(event);
  const entryId = event.pathParameters.id;

  const { rows } = await query(
    `SELECT e.*, a.understanding, a.structure, a.suggestion, a.question
     FROM emotion_entries e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN ai_responses a ON a.entry_id = e.id
     WHERE u.cognito_sub = $1 AND e.id = $2`,
    [sub, entryId]
  );

  if (!rows.length) return notFound('Entry not found');
  return ok(rows[0]);
}

async function deleteEntry(event) {
  const sub = getUserSub(event);
  const entryId = event.pathParameters.id;

  await query(
    `DELETE FROM emotion_entries e
     USING users u
     WHERE u.id = e.user_id AND u.cognito_sub = $1 AND e.id = $2`,
    [sub, entryId]
  );

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
      default: return badRequest('Method not allowed');
    }
  } catch (err) {
    return serverError(err);
  }
}
