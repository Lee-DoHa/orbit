import { query } from '/opt/nodejs/db.mjs';
import { getUserSub } from '/opt/nodejs/auth.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';

async function getWeeklyInsights(sub) {
  // Get user ID
  const { rows: userRows } = await query(
    'SELECT id FROM users WHERE cognito_sub = $1', [sub]
  );
  if (!userRows.length) return ok({ entries: 0 });
  const userId = userRows[0].id;

  // Aggregate last 7 days
  const { rows: stats } = await query(
    `SELECT
       COUNT(*)::int as entry_count,
       COALESCE(AVG(intensity), 0) as avg_intensity,
       COALESCE(STDDEV(intensity), 0) as intensity_stddev
     FROM emotion_entries
     WHERE user_id = $1 AND recorded_at > now() - interval '7 days'`,
    [userId]
  );

  // Top emotions
  const { rows: topEmotions } = await query(
    `SELECT unnest(emotion_ids) as emotion_id, COUNT(*) as cnt
     FROM emotion_entries
     WHERE user_id = $1 AND recorded_at > now() - interval '7 days'
     GROUP BY emotion_id ORDER BY cnt DESC LIMIT 3`,
    [userId]
  );

  // Daily breakdown (last 7 days)
  const { rows: daily } = await query(
    `SELECT
       recorded_at::date as day,
       AVG(intensity) as avg_intensity,
       COUNT(*)::int as count
     FROM emotion_entries
     WHERE user_id = $1 AND recorded_at > now() - interval '7 days'
     GROUP BY day ORDER BY day`,
    [userId]
  );

  // Context distribution
  const { rows: contexts } = await query(
    `SELECT context_tag, COUNT(*)::int as cnt
     FROM emotion_entries
     WHERE user_id = $1 AND recorded_at > now() - interval '7 days' AND context_tag IS NOT NULL
     GROUP BY context_tag ORDER BY cnt DESC`,
    [userId]
  );

  const stddev = parseFloat(stats[0].intensity_stddev) || 0;
  const stabilityIndex = Math.max(0, Math.min(100, Math.round(100 - stddev * 20)));

  // Previous week stability for comparison
  const { rows: prevStats } = await query(
    `SELECT COALESCE(STDDEV(intensity), 0) as intensity_stddev, COUNT(*)::int as cnt
     FROM emotion_entries
     WHERE user_id = $1
       AND recorded_at > now() - interval '14 days'
       AND recorded_at <= now() - interval '7 days'`,
    [userId]
  );

  // Only compute change if previous week had data; otherwise 0
  let stabilityChange = 0;
  if (prevStats[0]?.cnt > 0) {
    const prevStddev = parseFloat(prevStats[0]?.intensity_stddev) || 0;
    const prevStabilityIndex = Math.max(0, Math.min(100, Math.round(100 - prevStddev * 20)));
    stabilityChange = stabilityIndex - prevStabilityIndex;
  }

  // Total entry count for growth stage calculation
  const { rows: totalRows } = await query(
    'SELECT COUNT(*)::int as total FROM emotion_entries WHERE user_id = $1',
    [userId]
  );
  const totalEntryCount = totalRows[0]?.total || 0;

  return ok({
    entryCount: stats[0].entry_count,
    totalEntryCount,
    avgIntensity: parseFloat(parseFloat(stats[0].avg_intensity).toFixed(1)),
    stabilityIndex,
    stabilityChange,
    topEmotions: topEmotions.map(e => ({ emotionId: e.emotion_id, count: parseInt(e.cnt) })),
    daily: daily.map(d => ({
      day: d.day,
      avgIntensity: parseFloat(parseFloat(d.avg_intensity).toFixed(1)),
      count: d.count,
    })),
    contextDistribution: contexts.reduce((acc, c) => {
      acc[c.context_tag] = c.cnt;
      return acc;
    }, {}),
  });
}

async function getPatterns(sub) {
  const { rows: userRows } = await query(
    'SELECT id FROM users WHERE cognito_sub = $1', [sub]
  );
  if (!userRows.length) return ok([]);
  const userId = userRows[0].id;

  // Find emotion+context combos with 3+ occurrences in 7 days
  const { rows } = await query(
    `SELECT unnest(emotion_ids) as emotion_id, context_tag, COUNT(*) as cnt
     FROM emotion_entries
     WHERE user_id = $1 AND recorded_at > now() - interval '7 days'
     GROUP BY emotion_id, context_tag
     HAVING COUNT(*) >= 3
     ORDER BY cnt DESC`,
    [userId]
  );

  return ok(rows.map(r => ({
    emotionId: r.emotion_id,
    contextTag: r.context_tag,
    count: parseInt(r.cnt),
  })));
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});
    if (event.httpMethod !== 'GET') return badRequest('GET only');

    const sub = getUserSub(event);
    const path = event.path;

    if (path.endsWith('/patterns')) return await getPatterns(sub);
    return await getWeeklyInsights(sub);
  } catch (err) {
    return serverError(err);
  }
}
