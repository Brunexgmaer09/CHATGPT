# Chat Interface GPT-4o-Mini

Este projeto é uma interface de chat interativa inspirada no ChatGPT, utilizando o modelo GPT-4o-Mini da OpenAI. Ele oferece uma experiência de usuário semelhante ao ChatGPT, com uma interface web responsiva e um servidor backend para processar as solicitações.

## Site Totalmente feito por (Brunex)

## Screenshots
![Screenshot da Interface do Chat](https://github.com/user-attachments/assets/533c8f64-cc18-4ac1-8865-57fe75b33811)
![Exemplo de Conversa](https://github.com/user-attachments/assets/2ecfd6ac-c565-4f49-8d67-0ba2e009cccc)
![Exemplo de Conversa 1 ](https://github.com/user-attachments/assets/b141a23d-51b3-4a06-a087-f8742203883d)

## Características

- Interface de usuário moderna e responsiva
- Integração com a API OpenAI GPT-4o-Mini
- Suporte para histórico de conversas
- Formatação de mensagens com Markdown
- Destaque de sintaxe para blocos de código
- Animação de digitação para respostas do bot
- Sugestões de perguntas pré-definidas

## Tecnologias Utilizadas

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Highlight.js para destaque de sintaxe

- Backend:
  - Node.js
  - Express.js
  - OpenAI API

## Pré-requisitos

Antes de instalar o projeto, certifique-se de ter o seguinte instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 12 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

## Instalação

1. Clone o repositório:
git clone https://github.com/seu-usuario/chat-interface-gpt4o-mini.git
cd chat-interface-gpt4o-mini



2. Instale as dependências:
npm install
npm install --save openai
npm install express cors dotenv



3. Crie um arquivo `.env` na raiz do projeto e adicione sua chave API da OpenAI:
OPENAI_API_KEY=sua_chave_api_aqui



Certifique-se de substituir `sua_chave_api_aqui` pela sua chave API real da OpenAI.

## Executando o Projeto

1. Inicie o servidor backend:
node server.js



2. Abra o arquivo `index.html` em seu navegador ou use um servidor local para servir os arquivos estáticos.

## Estrutura do Projeto

- `index.html`: Estrutura HTML da interface do chat
- `style.css`: Estilos CSS para a interface
- `script.js`: Lógica do cliente para interação com o usuário e comunicação com o servidor
- `server.js`: Servidor Express que lida com as requisições à API da OpenAI

## Contribuindo

Contribuições são bem-vindas! Por favor, sinta-se à vontade para submeter pull requests ou abrir issues para sugerir melhorias ou reportar bugs.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## Aviso Legal

Este projeto utiliza a API da OpenAI e deve ser usado de acordo com os termos de serviço da OpenAi
