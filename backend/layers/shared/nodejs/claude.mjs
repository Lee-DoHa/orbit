const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Call Anthropic Claude API.
 * Returns null if ANTHROPIC_API_KEY is not set (caller handles mock fallback).
 */
export async function callClaude({
  systemPrompt,
  userMessage,
  model = 'claude-haiku-4-20250414',
  maxTokens = 1024,
  temperature = 0.7,
}) {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === '') {
    return null; // Caller must provide mock fallback
  }

  const start = Date.now();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const latencyMs = Date.now() - start;

  if (!data.content?.[0]?.text) {
    throw new Error('Claude returned empty response');
  }

  const rawText = data.content[0].text;

  return {
    content: rawText,
    model: data.model || model,
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
    latencyMs,
  };
}

/**
 * Parse JSON from Claude response, handling markdown code fences.
 */
export function parseClaudeJSON(text) {
  let cleaned = text.trim();
  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}
