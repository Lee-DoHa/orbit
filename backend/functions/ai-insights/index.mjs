import { query } from '/opt/nodejs/db.mjs';
import { getUserSub } from '/opt/nodejs/auth.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';
import { callClaude, parseClaudeJSON } from '/opt/nodejs/claude.mjs';

const EMOTION_NAMES = {
  1: '긴장', 2: '불안', 3: '피로', 4: '안정', 5: '설렘',
  6: '무기력', 7: '집중', 8: '만족', 9: '외로움', 10: '혼란',
};

const CONTEXT_NAMES = {
  work: '업무', relationship: '관계', health: '건강',
  family: '가족', growth: '자기계발', other: '기타',
};

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

function getMonthBounds(monthStr) {
  const start = monthStr ? `${monthStr}-01` : (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  })();
  const d = new Date(start);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  const end = d.toISOString().slice(0, 10);
  return { start, end };
}

async function getUserId(sub) {
  const { rows } = await query(
    'SELECT id, subscription_tier, persona FROM users WHERE cognito_sub = $1 AND deleted_at IS NULL',
    [sub]
  );
  return rows[0] || null;
}

// --- Weekly AI Summary ---

function generateMockWeeklySummary(entries, stability) {
  const count = entries.length;
  if (count === 0) {
    return {
      narrative: '이번 주에는 아직 감정 기록이 없어요. 첫 기록을 시작해보세요!',
      highlights: [],
      suggestion: '하루에 한 번, 느끼는 감정을 기록해보세요.',
    };
  }
  const topEmotions = {};
  entries.forEach(e => e.emotion_ids.forEach(id => { topEmotions[id] = (topEmotions[id] || 0) + 1; }));
  const topId = Object.entries(topEmotions).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topName = EMOTION_NAMES[topId] || '감정';

  return {
    narrative: `이번 주 ${count}개의 감정을 기록하셨어요. ${topName}이(가) 가장 자주 나타났고, 안정도는 ${stability}점이에요. 꾸준한 기록이 자기 이해를 깊게 만들고 있습니다.`,
    highlights: [
      `${topName}이(가) 가장 빈번한 감정`,
      `총 ${count}회 기록`,
      `안정도 ${stability}점`,
    ],
    suggestion: '가장 자주 느끼는 감정이 어떤 상황에서 나타나는지 관찰해보세요.',
  };
}

async function getWeeklySummary(sub) {
  const user = await getUserId(sub);
  if (!user) return badRequest('User not found');
  if (user.subscription_tier !== 'pro') return badRequest('Pro feature');

  const week = getWeekBounds();

  // Check cache
  const { rows: cached } = await query(
    `SELECT content, created_at FROM ai_summaries
     WHERE user_id = $1 AND summary_type = 'weekly' AND period_start = $2`,
    [user.id, week.start]
  );
  if (cached.length && (Date.now() - new Date(cached[0].created_at).getTime()) < 24 * 60 * 60 * 1000) {
    return ok({ ...cached[0].content, periodStart: week.start, periodEnd: week.end, cached: true });
  }

  // Gather data
  const { rows: entries } = await query(
    `SELECT emotion_ids, intensity, context_tag, note, recorded_at FROM emotion_entries
     WHERE user_id = $1 AND recorded_at >= $2 AND recorded_at < ($3::date + 1)
     ORDER BY recorded_at DESC`,
    [user.id, week.start, week.end]
  );

  const { rows: statsRows } = await query(
    `SELECT COALESCE(STDDEV(intensity), 0) as stddev, AVG(intensity) as avg_int, COUNT(*)::int as cnt
     FROM emotion_entries WHERE user_id = $1 AND recorded_at >= $2 AND recorded_at < ($3::date + 1)`,
    [user.id, week.start, week.end]
  );
  const stability = Math.round(Math.max(0, Math.min(100, 100 - (statsRows[0]?.stddev || 0) * 20)));

  // Try Claude
  const entrySummary = entries.slice(0, 15).map(e => {
    const names = e.emotion_ids.map(id => EMOTION_NAMES[id] || id).join(',');
    const ctx = e.context_tag ? CONTEXT_NAMES[e.context_tag] || e.context_tag : '';
    return `${new Date(e.recorded_at).toISOString().slice(5, 10)}: ${names} (강도${e.intensity}) ${ctx} ${e.note || ''}`.trim();
  }).join('\n');

  const claudeResult = await callClaude({
    systemPrompt: `You are an emotional wellness advisor for a Korean user.
Given their weekly emotional data, generate a warm, insightful summary in Korean.
Respond ONLY with valid JSON: {"narrative":"2-3 sentences","highlights":["string","string"],"suggestion":"one actionable tip"}`,
    userMessage: `이번 주 감정 기록 (${entries.length}건):\n${entrySummary || '기록 없음'}\n안정도: ${stability}/100`,
  });

  let content;
  if (claudeResult) {
    try {
      content = parseClaudeJSON(claudeResult.content);
    } catch {
      content = generateMockWeeklySummary(entries, stability);
    }
  } else {
    content = generateMockWeeklySummary(entries, stability);
  }

  // Cache
  await query(
    `INSERT INTO ai_summaries (user_id, summary_type, period_start, period_end, content, model_used, prompt_tokens, completion_tokens, latency_ms)
     VALUES ($1, 'weekly', $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, summary_type, period_start) DO UPDATE SET content = $4, model_used = $5, created_at = now()`,
    [user.id, week.start, week.end, JSON.stringify(content),
     claudeResult?.model || 'mock', claudeResult?.inputTokens || 0,
     claudeResult?.outputTokens || 0, claudeResult?.latencyMs || 0]
  );

  return ok({ ...content, periodStart: week.start, periodEnd: week.end, cached: false });
}

// --- Pattern Explanations ---

function generateMockPatternExplanation(emotionName, contextName, count) {
  const explanation = contextName
    ? `${contextName} 상황에서 ${emotionName}이(가) ${count}회 반복되고 있어요. 이 패턴은 특정 환경적 요인과 관련이 있을 수 있습니다.`
    : `${emotionName}이(가) 최근 ${count}회 반복되고 있어요. 이 감정이 자주 나타나는 데에는 이유가 있을 거예요.`;
  const suggestion = contextName
    ? `${contextName} 상황 전후로 5분간 호흡을 하고 감정 변화를 관찰해보세요.`
    : `이 감정이 나타날 때의 상황과 시간대를 함께 기록해보세요.`;
  return { explanation, suggestion };
}

async function getPatternExplanations(sub) {
  const user = await getUserId(sub);
  if (!user) return badRequest('User not found');
  if (user.subscription_tier !== 'pro') return badRequest('Pro feature');

  // Get patterns (same SQL as insights)
  const { rows: patterns } = await query(
    `SELECT emotion_ids[1] as emotion_id, context_tag, COUNT(*)::int as cnt
     FROM emotion_entries
     WHERE user_id = $1 AND recorded_at > now() - interval '7 days'
     GROUP BY emotion_ids[1], context_tag
     HAVING COUNT(*) >= 2
     ORDER BY cnt DESC LIMIT 5`,
    [user.id]
  );

  const results = [];
  for (const p of patterns) {
    const emotionName = EMOTION_NAMES[p.emotion_id] || `감정${p.emotion_id}`;
    const contextName = p.context_tag ? (CONTEXT_NAMES[p.context_tag] || p.context_tag) : null;
    const patternHash = `${p.emotion_id}_${p.context_tag || 'none'}`;

    // Check cache
    const { rows: cached } = await query(
      `SELECT explanation, suggestion FROM ai_pattern_explanations
       WHERE user_id = $1 AND pattern_hash = $2`,
      [user.id, patternHash]
    );

    if (cached.length) {
      results.push({
        emotionId: p.emotion_id, contextTag: p.context_tag, count: p.cnt,
        explanation: cached[0].explanation, suggestion: cached[0].suggestion, isAI: true,
      });
      continue;
    }

    // Try Claude
    const claudeResult = await callClaude({
      systemPrompt: `You are an emotional pattern analyst. Given a detected emotional pattern, provide a brief explanation and one practical suggestion in Korean.
Respond ONLY with valid JSON: {"explanation":"1-2 sentences","suggestion":"1 sentence actionable tip"}`,
      userMessage: `패턴: ${emotionName}${contextName ? ` + ${contextName}` : ''} (${p.cnt}회/주)`,
    });

    let explanation, suggestion;
    if (claudeResult) {
      try {
        const parsed = parseClaudeJSON(claudeResult.content);
        explanation = parsed.explanation;
        suggestion = parsed.suggestion;
      } catch {
        const mock = generateMockPatternExplanation(emotionName, contextName, p.cnt);
        explanation = mock.explanation;
        suggestion = mock.suggestion;
      }
    } else {
      const mock = generateMockPatternExplanation(emotionName, contextName, p.cnt);
      explanation = mock.explanation;
      suggestion = mock.suggestion;
    }

    // Cache
    await query(
      `INSERT INTO ai_pattern_explanations (user_id, pattern_hash, emotion_id, context_tag, explanation, suggestion, model_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, pattern_hash) DO UPDATE SET explanation = $5, suggestion = $6, created_at = now()`,
      [user.id, patternHash, p.emotion_id, p.context_tag, explanation, suggestion,
       claudeResult?.model || 'mock']
    );

    results.push({
      emotionId: p.emotion_id, contextTag: p.context_tag, count: p.cnt,
      explanation, suggestion, isAI: !!claudeResult,
    });
  }

  return ok(results);
}

// --- Monthly Narrative ---

function generateMockMonthlyNarrative(entryCount, stability) {
  return {
    narrative: entryCount > 0
      ? `이번 달 ${entryCount}개의 감정을 기록하며 자기 이해를 깊게 해왔어요. 안정도 ${stability}점으로 꾸준한 성장을 보여주고 있습니다.`
      : '이번 달은 아직 충분한 기록이 없어요. 꾸준한 기록이 성장의 시작입니다.',
    growthArc: entryCount >= 5 ? '초반 탐색 → 패턴 인식 → 자기 이해 심화' : '기록 시작 단계',
    emotionalHighlights: entryCount > 0
      ? ['감정 기록 습관 형성 중', '자기 인식 능력 향상']
      : ['첫 기록을 시작해보세요'],
    lookAhead: '다음 달에는 감정이 나타나는 상황을 더 세심하게 관찰해보세요.',
  };
}

async function getMonthlyNarrative(event, sub) {
  const user = await getUserId(sub);
  if (!user) return badRequest('User not found');
  if (user.subscription_tier !== 'pro') return badRequest('Pro feature');

  const params = event.queryStringParameters || {};
  const month = getMonthBounds(params.month);

  // Check cache
  const { rows: cached } = await query(
    `SELECT content FROM ai_summaries
     WHERE user_id = $1 AND summary_type = 'monthly' AND period_start = $2`,
    [user.id, month.start]
  );
  if (cached.length) {
    return ok({ ...cached[0].content, periodStart: month.start, periodEnd: month.end, cached: true });
  }

  // Gather monthly data
  const { rows: stats } = await query(
    `SELECT COUNT(*)::int as cnt, AVG(intensity) as avg_int,
     COALESCE(STDDEV(intensity), 0) as stddev
     FROM emotion_entries WHERE user_id = $1 AND recorded_at >= $2 AND recorded_at <= $3`,
    [user.id, month.start, month.end]
  );
  const stability = Math.round(Math.max(0, Math.min(100, 100 - (stats[0]?.stddev || 0) * 20)));

  const { rows: entries } = await query(
    `SELECT emotion_ids, intensity, context_tag, recorded_at FROM emotion_entries
     WHERE user_id = $1 AND recorded_at >= $2 AND recorded_at <= $3
     ORDER BY recorded_at`, [user.id, month.start, month.end]
  );

  const entrySummary = entries.slice(0, 20).map(e => {
    const names = e.emotion_ids.map(id => EMOTION_NAMES[id]).join(',');
    return `${new Date(e.recorded_at).toISOString().slice(5, 10)}: ${names} (강도${e.intensity})`;
  }).join('\n');

  const claudeResult = await callClaude({
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `You are an emotional growth narrator for a Korean user.
Given their monthly emotional data, write a warm, insightful narrative about their emotional journey.
Respond ONLY with valid JSON: {"narrative":"3-4 sentences","growthArc":"one-line summary","emotionalHighlights":["string"],"lookAhead":"1-2 sentences for next month"}`,
    userMessage: `${month.start} ~ ${month.end} 감정 기록 (${stats[0]?.cnt || 0}건):\n${entrySummary || '없음'}\n안정도: ${stability}/100`,
  });

  let content;
  if (claudeResult) {
    try { content = parseClaudeJSON(claudeResult.content); }
    catch { content = generateMockMonthlyNarrative(stats[0]?.cnt || 0, stability); }
  } else {
    content = generateMockMonthlyNarrative(stats[0]?.cnt || 0, stability);
  }

  await query(
    `INSERT INTO ai_summaries (user_id, summary_type, period_start, period_end, content, model_used, prompt_tokens, completion_tokens, latency_ms)
     VALUES ($1, 'monthly', $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, summary_type, period_start) DO UPDATE SET content = $4, model_used = $5`,
    [user.id, month.start, month.end, JSON.stringify(content),
     claudeResult?.model || 'mock', claudeResult?.inputTokens || 0,
     claudeResult?.outputTokens || 0, claudeResult?.latencyMs || 0]
  );

  return ok({ ...content, periodStart: month.start, periodEnd: month.end, cached: false });
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});
    const path = event.path;
    const sub = getUserSub(event);

    if (path.endsWith('/weekly-summary')) return await getWeeklySummary(sub);
    if (path.endsWith('/pattern-explanations')) return await getPatternExplanations(sub);
    if (path.endsWith('/monthly-narrative')) return await getMonthlyNarrative(event, sub);

    return badRequest('Unknown ai-insights endpoint');
  } catch (err) {
    return serverError(err);
  }
}
