import { query } from '/opt/nodejs/db.mjs';
import { getUserSub } from '/opt/nodejs/auth.mjs';
import { ok, badRequest, serverError } from '/opt/nodejs/response.mjs';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_MOCK = !OPENAI_API_KEY || OPENAI_API_KEY === '';

const EMOTION_NAMES = {
  1: '긴장', 2: '불안', 3: '피로', 4: '안정', 5: '설렘',
  6: '무기력', 7: '집중', 8: '만족', 9: '외로움', 10: '혼란',
};

const CONTEXT_NAMES = {
  work: '업무', relationship: '관계', health: '건강',
  family: '가족', growth: '자기계발', other: '기타',
};

function generateMockResponse(emotionNames, intensity, context) {
  const emotions = emotionNames.join(', ');
  return {
    understanding: `${emotions}을(를) 느끼고 계시는군요. 강도 ${intensity}의 감정은 지금 당신에게 중요한 신호입니다.`,
    structure: `${context ? CONTEXT_NAMES[context] + ' 상황에서 ' : ''}이 감정이 반복되는 패턴이 있는지 살펴볼 필요가 있어요. 최근 기록들과 비교해보면 더 명확해질 거예요.`,
    suggestion: `잠시 5분간 깊은 호흡을 해보세요. 들숨 4초, 날숨 6초의 리듬으로 3회 반복하면 감정의 강도를 조절하는 데 도움이 됩니다.`,
    question: intensity >= 4 ? '오늘 이 감정을 가장 강하게 느낀 순간은 언제였나요?' : null,
  };
}

async function callOpenAI(emotionNames, intensity, context, note, recentHistory) {
  const emotions = emotionNames.join(', ');
  const systemPrompt = `You are "거울" (Mirror), a Korean emotional structure analyst.
Given the user's emotion entry, provide:
1. 이해: Acknowledge the feeling in context. 1-2 sentences in Korean.
2. 구조: Identify patterns or structure. 1-2 sentences in Korean.
3. 제안: One concrete, small action. 1-2 sentences in Korean.
4. 성찰 질문: One thought-provoking question (optional, null if not needed). In Korean.

Be warm but not patronizing. Never diagnose or prescribe.
Respond ONLY with valid JSON: {"understanding":"...","structure":"...","suggestion":"...","question":"..."}`;

  const userMessage = `오늘의 감정: ${emotions}
강도: ${intensity}/5
${context ? `상황: ${CONTEXT_NAMES[context]}` : ''}
${note ? `메모: ${note}` : ''}
${recentHistory ? `\n최근 기록:\n${recentHistory}` : ''}`;

  const start = Date.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await res.json();
  const latencyMs = Date.now() - start;
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);

  return {
    ...parsed,
    model: 'gpt-4o-mini',
    promptTokens: data.usage?.prompt_tokens,
    completionTokens: data.usage?.completion_tokens,
    latencyMs,
  };
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return ok({});
    if (event.httpMethod !== 'POST') return badRequest('POST only');

    const sub = getUserSub(event);
    const body = JSON.parse(event.body);

    if (!body.entryId) return badRequest('entryId is required');

    // Fetch the entry
    const { rows: entryRows } = await query(
      `SELECT e.* FROM emotion_entries e
       JOIN users u ON u.id = e.user_id
       WHERE u.cognito_sub = $1 AND e.id = $2`,
      [sub, body.entryId]
    );
    if (!entryRows.length) return badRequest('Entry not found');

    const entry = entryRows[0];
    const emotionNames = entry.emotion_ids.map(id => EMOTION_NAMES[id] || `감정${id}`);

    let result;
    if (USE_MOCK) {
      result = generateMockResponse(emotionNames, entry.intensity, entry.context_tag);
      result.model = 'mock';
      result.promptTokens = 0;
      result.completionTokens = 0;
      result.latencyMs = 0;
    } else {
      // Get recent history for context
      const { rows: historyRows } = await query(
        `SELECT emotion_ids, intensity, context_tag, recorded_at
         FROM emotion_entries
         WHERE user_id = $1 AND recorded_at > now() - interval '7 days' AND id != $2
         ORDER BY recorded_at DESC LIMIT 10`,
        [entry.user_id, entry.id]
      );

      const recentHistory = historyRows.map(h => {
        const names = h.emotion_ids.map(id => EMOTION_NAMES[id]).join(',');
        return `${h.recorded_at.toISOString().slice(0, 10)}: ${names} (강도${h.intensity})`;
      }).join('\n');

      result = await callOpenAI(emotionNames, entry.intensity, entry.context_tag, entry.note, recentHistory);
    }

    // Save AI response
    const { rows } = await query(
      `INSERT INTO ai_responses (entry_id, user_id, understanding, structure, suggestion, question, model_used, prompt_tokens, completion_tokens, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [entry.id, entry.user_id, result.understanding, result.structure, result.suggestion,
       result.question || null, result.model, result.promptTokens, result.completionTokens, result.latencyMs]
    );

    return ok({
      understanding: result.understanding,
      structure: result.structure,
      suggestion: result.suggestion,
      question: result.question || null,
    });
  } catch (err) {
    return serverError(err);
  }
}
