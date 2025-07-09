require('dotenv').config();
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Definida' : 'Não definida');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Definida' : 'Não definida');
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar clientes apenas se as chaves estiverem disponíveis
let openai = null;
let genAI = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Funções de validação de modelo
function isValidOpenAIModel(model) {
  const validModels = [
    'gpt-4-turbo',
    'gpt-4-turbo-2024-04-09',
    'gpt-4-turbo-preview',
    'gpt-4-0125-preview',
    'o1-preview',
    'o1-preview-2024-09-12',
    'o1-mini',
    'o1-mini-2024-09-12',
    'gpt-4o-mini',
    'gpt-4o-mini-2024-07-18'
  ];
  return validModels.includes(model);
}

function isValidGeminiModel(model) {
  const validModels = [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];
  return validModels.includes(model);
}

function getModelProvider(model) {
  if (isValidOpenAIModel(model)) return 'openai';
  if (isValidGeminiModel(model)) return 'gemini';
  return null;
}

app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  const { message, history, model } = req.body;
  
  // Validar o modelo e determinar o provedor
  const provider = getModelProvider(model);
  if (!provider) {
    res.status(400).json({ error: 'Modelo inválido' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    if (provider === 'openai') {
      if (!openai) {
        throw new Error('OpenAI API key not configured');
      }
      await handleOpenAIRequest(res, message, history, model);
    } else if (provider === 'gemini') {
      if (!genAI) {
        throw new Error('Gemini API key not configured');
      }
      await handleGeminiRequest(res, message, history, model);
    }
  } catch (error) {
    console.error(`${provider.toUpperCase()} API error:`, error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'An error occurred while processing your request' })}\n\n`);
  } finally {
    res.end();
  }
});

// Função para lidar com requisições OpenAI
async function handleOpenAIRequest(res, message, history, model) {
  const messages = [
    { role: "system", content: "Seu nome é Carol. voce é uma assistente eficiente em criar códigos em C++ e C#, você também é uma especialista em engenharia de software crie codigos usando as melhores técnicas dessas duas linguagens de programação,Você é uma programadora profissional." },
    ...history,
    { role: "user", content: message }
  ];

  const stream = await openai.chat.completions.create({
    model: model,
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
}

// Função para lidar com requisições Gemini
async function handleGeminiRequest(res, message, history, model) {
  // Mapear modelos Gemini para nomes corretos da API
  const geminiModelMap = {
    'gemini-pro': 'gemini-pro',
    'gemini-pro-vision': 'gemini-pro-vision',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-1.5-flash': 'gemini-1.5-flash'
  };

  const geminiModel = genAI.getGenerativeModel({ model: geminiModelMap[model] });

  // Converter histórico para formato Gemini
  let conversationHistory = "Seu nome é Carol. voce é uma assistente eficiente em criar códigos em C++ e C#, você também é uma especialista em engenharia de software crie codigos usando as melhores técnicas dessas duas linguagens de programação,Você é uma programadora profissional.\n\n";
  
  history.forEach(msg => {
    if (msg.role === 'user') {
      conversationHistory += `Usuário: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      conversationHistory += `Carol: ${msg.content}\n`;
    }
  });
  
  conversationHistory += `Usuário: ${message}\nCarol: `;

  const result = await geminiModel.generateContentStream(conversationHistory);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
    }
  }
  res.write('data: [DONE]\n\n');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
