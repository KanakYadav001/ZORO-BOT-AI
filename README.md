# Zoro AI

Zoro AI is a full-stack real-time AI chat application.

It includes:
- JWT authentication
- Socket.IO real-time chat
- RAG memory with Pinecone
- Groq chat completion
- Google embeddings
- Tavily web search for fresh context
- React + Vite frontend UI

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Socket.IO client
- Backend: Node.js, Express, Socket.IO, MongoDB (Mongoose)
- AI: Groq SDK, Google GenAI embeddings
- Retrieval: Pinecone vector database
- Web context: Tavily search API
- Mail: Nodemailer (Gmail OAuth2)

## Project Structure

```text
ZORO-BOT-AI/
	backend/
		server.js
		package.json
		src/
			app.js
			borker/
			controller/
			db/
			middleware/
			models/
			routers/
			service/
			socket/
	frontend/
		package.json
		vite.config.js
		src/
			App.jsx
			components/
			services/
	README.md
```

## Environment Setup

Create these env files before running the app.

### 1) Backend env file

Create [backend/.env](backend/.env):

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name

TAVILY_API_KEY=your_tavily_api_key

EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

### 2) Frontend env file

Create [frontend/.env](frontend/.env):

```env
VITE_BACKEND_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Run Locally

Open two terminals.

### Terminal 1: Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on `http://localhost:3000` by default.

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite (usually `http://localhost:5173`).

## API Routes

Base URL: `/api`

Auth routes:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Chat routes:
- `POST /chat/create`
- `GET /chat/get`
- `DELETE /chat/delete/:chatId`
- `GET /chat/messages/:chatId`

## Socket Events

- Client emits `message` with payload:

```json
{ "chatId": "<chat-id>", "data": "user message" }
```

- Server emits `response` with assistant text.

Socket auth uses JWT token passed in query during connection.

## Tavily Integration (Web Context)

When the user asks a real-time type query (example: latest news, today updates, scores, weather), backend can fetch web context from Tavily and pass it to the model.

Important notes:
- Tavily data is optional and timeout-protected.
- If Tavily is slow or unavailable, chat still works with normal RAG context.

## Troubleshooting

- If frontend crashes at startup, check [frontend/.env](frontend/.env) values for `VITE_BACKEND_URL` and `VITE_SOCKET_URL`.
- If socket is not connecting, verify backend is running and token is valid.
- If AI reply is slow, check external API latency (Groq, Google embeddings, Pinecone, Tavily).
- If web/news answers are missing, confirm `TAVILY_API_KEY` is valid in [backend/.env](backend/.env).

## Security Note

Do not commit real secrets in env files.

If any key is exposed publicly, rotate it immediately.
