import { query } from '/opt/nodejs/db.mjs';
import { getUserSub, getUserEmail } from '/opt/nodejs/auth.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';

async function getOrCreateUser(sub, email) {
  const { rows } = await query(
    `INSERT INTO users (cognito_sub, email) VALUES ($1, $2)
     ON CONFLICT (cognito_sub) DO UPDATE SET updated_at = now()
     RETURNING id, email, display_name, subscription_tier, persona, timezone, created_at`,
    [sub, email]
  );
  return rows[0];
}

async function updateUser(sub, updates) {
  const allowed = ['display_name', 'persona', 'timezone'];
  const sets = [];
  const values = [sub];
  let idx = 2;

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
     RETURNING id, email, display_name, subscription_tier, persona, timezone, created_at`,
    values
  );

  return ok(rows[0]);
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
      default:
        return badRequest('Method not allowed');
    }
  } catch (err) {
    return serverError(err);
  }
}
