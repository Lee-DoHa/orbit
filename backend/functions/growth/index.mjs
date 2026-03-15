import { query } from '/opt/nodejs/db.mjs';
import { getUserSub } from '/opt/nodejs/auth.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';

async function getUserId(sub) {
  const { rows } = await query('SELECT id FROM users WHERE cognito_sub = $1', [sub]);
  return rows[0]?.id;
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

function getMonthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

const EXPERIMENT_POOL = [
  '이번 주 2회, 10분 산책을 시도해보세요.',
  '하루 한 번, 감사한 것 3가지를 적어보세요.',
  '이번 주 한 번, 평소 안 가던 카페에서 시간을 보내보세요.',
  '잠들기 전 5분 호흡 명상을 3일간 시도해보세요.',
  '이번 주 한 사람에게 진심 어린 칭찬을 해보세요.',
  '하루 중 가장 강한 감정을 느낀 순간을 메모해보세요.',
  '이번 주 2회, 좋아하는 음악을 들으며 15분 산책해보세요.',
  '매일 아침 오늘의 목표를 한 문장으로 적어보세요.',
];

function getExperimentText(weekStart) {
  // Deterministic selection based on week start date
  const dateNum = parseInt(weekStart.replace(/-/g, ''), 10);
  return EXPERIMENT_POOL[dateNum % EXPERIMENT_POOL.length];
}

async function handleExperiment(event, sub) {
  const userId = await getUserId(sub);
  if (!userId) return badRequest('User not found');
  const weekStart = getWeekStart();

  if (event.httpMethod === 'GET') {
    const { rows } = await query(
      'SELECT * FROM experiment_responses WHERE user_id = $1 AND week_start = $2',
      [userId, weekStart]
    );
    // Always return experiment_text even if no response yet
    if (rows[0]) return ok(rows[0]);
    return ok({ experiment_text: getExperimentText(weekStart), status: null, week_start: weekStart });
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    if (!body.status || !['completed', 'skipped'].includes(body.status)) {
      return badRequest('status must be "completed" or "skipped"');
    }

    const experimentText = getExperimentText(weekStart);

    const { rows } = await query(
      `INSERT INTO experiment_responses (user_id, week_start, experiment_text, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, week_start) DO UPDATE SET status = $4
       RETURNING *`,
      [userId, weekStart, experimentText, body.status]
    );

    return ok(rows[0]);
  }

  return badRequest('Method not allowed');
}

async function handleReflection(event, sub) {
  const userId = await getUserId(sub);
  if (!userId) return badRequest('User not found');

  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const monthStart = params.month ? `${params.month}-01` : getMonthStart();

    const { rows } = await query(
      'SELECT * FROM reflections WHERE user_id = $1 AND month_start = $2',
      [userId, monthStart]
    );
    return ok(rows[0] || null);
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    if (!body.content?.trim()) return badRequest('content is required');

    const monthStart = getMonthStart();

    const { rows } = await query(
      `INSERT INTO reflections (user_id, month_start, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, month_start) DO UPDATE SET content = $3
       RETURNING *`,
      [userId, monthStart, body.content.trim()]
    );

    return ok(rows[0]);
  }

  return badRequest('Method not allowed');
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});

    const sub = getUserSub(event);
    const path = event.path;

    if (path.includes('/experiment')) return await handleExperiment(event, sub);
    if (path.includes('/reflection')) return await handleReflection(event, sub);

    return badRequest('Unknown growth endpoint');
  } catch (err) {
    return serverError(err);
  }
}
