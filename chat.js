export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key não configurada no servidor.' });
  }

  const { messages, systemPrompt } = req.body;

  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: 'Pedido inválido.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erro da API OpenAI.' });
    }

    const reply = data.choices?.[0]?.message?.content || 'Sem resposta.';
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno do servidor: ' + err.message });
  }
}
