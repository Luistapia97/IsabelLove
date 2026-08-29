import { sql } from '@vercel/postgres';

const headers = { 'Content-Type': 'application/json' };

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS memories (
      date_key DATE PRIMARY KEY,
      question TEXT NOT NULL,
      answer_luis TEXT NOT NULL DEFAULT '',
      answer_ana TEXT NOT NULL DEFAULT '',
      yes_luis BOOLEAN NOT NULL DEFAULT FALSE,
      yes_ana BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS yes_luis BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS yes_ana BOOLEAN NOT NULL DEFAULT FALSE`;
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await ensureTable();

    if (request.method === 'GET') {
      const result = await sql`
        SELECT date_key, question, answer_luis, answer_ana, yes_luis, yes_ana, updated_at
        FROM memories
        ORDER BY date_key DESC
      `;
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json({ memories: result.rows });
    }

    const { date, question, author, answer, yes } = request.body || {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !question || !['luis', 'ana'].includes(author) || (typeof answer !== 'string' && yes !== true)) {
      Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value));
      return response.status(400).json({ error: 'Datos de recuerdo inválidos' });
    }

    const luisAnswer = author === 'luis' && typeof answer === 'string' ? answer.trim() : '';
    const anaAnswer = author === 'ana' && typeof answer === 'string' ? answer.trim() : '';
    await sql`
      INSERT INTO memories (date_key, question, answer_luis, answer_ana, yes_luis, yes_ana, updated_at)
      VALUES (${date}, ${question.trim()}, ${luisAnswer}, ${anaAnswer}, ${author === 'luis' && yes === true}, ${author === 'ana' && yes === true}, NOW())
      ON CONFLICT (date_key) DO UPDATE SET
        question = EXCLUDED.question,
        answer_luis = CASE WHEN ${author} = 'luis' THEN EXCLUDED.answer_luis ELSE memories.answer_luis END,
        answer_ana = CASE WHEN ${author} = 'ana' THEN EXCLUDED.answer_ana ELSE memories.answer_ana END,
        yes_luis = CASE WHEN ${author} = 'luis' AND ${yes === true} THEN TRUE ELSE memories.yes_luis END,
        yes_ana = CASE WHEN ${author} = 'ana' AND ${yes === true} THEN TRUE ELSE memories.yes_ana END,
        updated_at = NOW()
    `;
    Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value));
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Memories API error:', error);
    Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value));
    return response.status(500).json({ error: 'La base de datos no está disponible' });
  }
}
