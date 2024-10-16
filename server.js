require('dotenv').config();
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Definida' : 'Não definida');
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  const { message, history, model } = req.body;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    const messages = [
      { role: "system", content: "Seu nome é Carol. voce é uma assistente eficiente em criar códigos em C++ e C#, você também é uma especialista em engenharia de software crie codigos usando as melhores técnicas dessas duas linguagens de programação,Você é uma programadora profissional." },
      ...history,
      { role: "user", content: message }
    ];

    const stream = await openai.chat.completions.create({
      model: model,  // Use o modelo especificado
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
