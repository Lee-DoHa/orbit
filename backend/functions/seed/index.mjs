import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '/opt/nodejs/db.mjs';
import { ok, serverError } from '/opt/nodejs/response.mjs';

export async function handler(event) {
  try {
    const schemaPath = join(process.env.LAMBDA_TASK_ROOT, 'schema.sql');
    const sql = readFileSync(schemaPath, 'utf8');
    await query(sql);

    // Run migration-v2 for additional tables
    try {
      const migrationPath = join(process.env.LAMBDA_TASK_ROOT, 'migration-v2.sql');
      const migrationSql = readFileSync(migrationPath, 'utf8');
      await query(migrationSql);
    } catch (migErr) {
      console.log('migration-v2 skipped:', migErr.message);
    }

    return ok({ message: 'Database schema initialized successfully' });
  } catch (err) {
    return serverError(err);
  }
}
