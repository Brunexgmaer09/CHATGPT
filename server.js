require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    // Prepare messages array with system message and history
    const messages = [
      { role: "system", content: "Você é um assistente útil." },
      ...history,
      { role: "user", content: message }
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // Certifique-se de usar um modelo válido
      messages: messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred while processing your request' })}\n\n`);
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));