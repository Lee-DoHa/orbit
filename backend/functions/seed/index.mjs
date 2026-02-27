import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '/opt/nodejs/db.mjs';
import { ok, serverError } from '/opt/nodejs/response.mjs';

export async function handler(event) {
  try {
    const schemaPath = join(process.env.LAMBDA_TASK_ROOT, 'schema.sql');
    const sql = readFileSync(schemaPath, 'utf8');
    await query(sql);
    return ok({ message: 'Database schema initialized successfully' });
  } catch (err) {
    return serverError(err);
  }
}
