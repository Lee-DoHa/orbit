import { query } from '/opt/nodejs/db.mjs';
import { getUserSub, getUserEmail } from '/opt/nodejs/auth.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';

async function getOrCreateUser(sub, email) {
  const { rows } = await query(
    `INSERT INTO users (cognito_sub, email) VALUES ($1, $2)
     ON CONFLICT (cognito_sub) DO UPDATE SET updated_at = now()
     RETURNING id, email, display_name, subscription_tier, persona, timezone, reminder_enabled, created_at`,
    [sub, email]
  );
  return rows[0];
}

async function updateUser(sub, updates) {
  const allowed = ['display_name', 'persona', 'timezone', 'reminder_enabled'];
  const sets = [];
  const values = [sub];
  let idx = 2;

  // Demo-only: subscription tier toggle (would be handled by payment provider in production)
  if (updates._demo_subscription && ['free', 'pro'].includes(updates._demo_subscription)) {
    sets.push(`subscription_tier = $${idx}`);
    values.push(updates._demo_subscription);
    idx++;
  }

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sets.push(`${key} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }

  if (!sets.length) return badRequest('No valid fields to update');

  sets.push('updated_at = now()');
  const { rows } = await query(
    `UPDATE users SET ${sets.join(', ')} WHERE cognito_sub = $1
     RETURNING id, email, display_name, subscription_tier, persona, timezone, reminder_enabled, created_at`,
    values
  );

  return ok(rows[0]);
}

async function deleteUser(sub) {
  const { rows } = await query(
    `SELECT id FROM users WHERE cognito_sub = $1 AND deleted_at IS NULL`,
    [sub]
  );
  if (!rows.length) return ok({ deleted: false });

  const userId = rows[0].id;

  // Delete all user data (respecting FK order: feedback → ai_responses → entries)
  await query('DELETE FROM mirror_feedback WHERE user_id = $1', [userId]);
  await query('DELETE FROM experiment_responses WHERE user_id = $1', [userId]);
  await query('DELETE FROM reflections WHERE user_id = $1', [userId]);
  await query('DELETE FROM ai_responses WHERE user_id = $1', [userId]);
  await query('DELETE FROM emotion_entries WHERE user_id = $1', [userId]);
  await query('DELETE FROM push_tokens WHERE user_id = $1', [userId]);
  // Hard delete the user row
  await query('DELETE FROM users WHERE id = $1', [userId]);

  return ok({ deleted: true });
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});

    const sub = getUserSub(event);
    const email = getUserEmail(event);

    switch (event.httpMethod) {
      case 'GET': {
        const user = await getOrCreateUser(sub, email);
        return ok(user);
      }
      case 'PUT': {
        const body = JSON.parse(event.body);
        return await updateUser(sub, body);
      }
      case 'DELETE': {
        return await deleteUser(sub);
      }
      default:
        return badRequest('Method not allowed');
    }
  } catch (err) {
    return serverError(err);
  }
}
