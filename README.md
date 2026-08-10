# 🚀 Zoro AI - Real-Time RAG Chat Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)

Zoro AI is a full-stack real-time chat application with Retrieval-Augmented Generation (RAG) using Pinecone and Groq, WebSocket streaming via Socket.IO, background email notifications, and a lightweight React + Tailwind UI.

---

## Quick overview

- Real-time chat via Socket.IO; server emits `response` and client emits `message` events.
- RAG using Pinecone embeddings + Groq LLM for context-aware replies.
- Welcome/login emails via Nodemailer (invoked directly by the server; no message queue).
- Auth using JWT; server sets an `token` cookie and also returns the token in responses.

---

## Tech stack

- Frontend: React 19, Vite, Tailwind CSS, Framer Motion, lucide-react, socket.io-client
-- Backend: Node.js, Express 5, Socket.IO, Mongoose (MongoDB), JWT, Nodemailer (no message queue)
- AI: Groq SDK (`groq-sdk`) and Google GenAI for embeddings
- Vector DB: Pinecone (`@pinecone-database/pinecone`)

---

## Repository structure

See the main areas of the project:

```
Zoro-Ai-New/
├── backend/
│   ├── server.js                 # HTTP & Socket.IO server entry
│   ├── package.json
│   └── src/
│       ├── app.js                # Express app & route mounting
│       ├── borker/               # Email handlers (listener.js) — invoked directly (no message queue)
│       │   └── listener.js       # Email handlers
│       ├── controller/           # `user.controller.js`, `chat.controller.js`
│       ├── db/                   # MongoDB connection (`db.js`)
│       ├── middleware/           # `auth.middleware.js`
│       ├── models/               # Mongoose schemas for users, chats, messages
│       ├── routers/              # `user.router.js`, `chat.router.js`
│       ├── service/              # `ai.service.js`, `pinecone.service.js`, `mail.service.js`
│       └── socket/               # `socket.server.js` (Socket.IO handlers)
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/           # AuthPage, ChatInterface, Sidebar, UserProfilePage
│       └── services/             # API client used by the UI
└── README.md
```

---

## Environment variables

Create a `.env` file inside the `backend/` folder with the values below. These are read by the server and the services under `src/service/`.

```
# Server
PORT=3000
FRONTEND_URL=https://zoro-bot-ai.vercel.app

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ZORO-AI

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Groq & Google GenAI (used for chat completion and embeddings)
GROQ_API_KEY=your_groq_api_key
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name

# (No RabbitMQ required)

# Email (Gmail OAuth2 flow)
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

Notes:
- `ai.service.js` requires both `GROQ_API_KEY` and `GOOGLE_GENAI_API_KEY` (embeddings + Groq chat calls).
- `pinecone.service.js` uses `PINECONE_API_KEY` and `PINECONE_INDEX_NAME`.

---

## Running the project (local)

1) Backend

```bash
cd backend
npm install
# Start the server directly
node server.js
```

The server listens on `http://localhost:3000` by default (or `PORT`).

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs with Vite (default `http://localhost:5173`). The frontend expects a `VITE_SOCKET_URL` environment variable during build/dev that points to your backend Socket.IO endpoint.

---

## API endpoints (backend)

Auth (`/api/auth`)

-- `POST /api/auth/register` — Register a new user (expects `name`, `email`, `password`) and sends a welcome email via the mail service.
- `POST /api/auth/login` — Login with `email` and `password`. Server sets an HTTP-only `token` cookie and returns a token in the response.
- `POST /api/auth/logout` — Clears the auth cookie.
- `GET /api/auth/me` — Returns current user profile (protected route).

Chat (`/api/chat`)

- `POST /api/chat/create` — Create a new chat (protected).
- `GET /api/chat/get` — Get all chats for the authenticated user.
- `DELETE /api/chat/delete/:chatId` — Delete a specific chat and its messages.
- `GET /api/chat/messages/:chatId` — Get messages for a chat.

All protected endpoints use the `auth.middleware.js` middleware which expects a valid JWT (the frontend stores a token and also relies on the cookie).

---

## Socket.IO events

- Client emits: `message` — payload: `{ chatId, data }` (server saves the user message, creates embeddings, queries Pinecone for context, calls the LLM, streams back a `response`, and stores the assistant reply).
- Server emits: `response` — payload: assistant reply (string).

Authentication: the Socket.IO connection is authorized using a JWT passed in the socket query (`token`). If missing/invalid, connection is rejected.

---

## Notes & gotchas

- Backend `package.json` currently does not include a `dev` script; run `node server.js` or add your own script if you prefer.
- Frontend requires `VITE_SOCKET_URL` when running locally — set it to `http://localhost:3000` (or your backend host) in a `.env` used by Vite.
- Emails are sent via Nodemailer with OAuth2 credentials — verify `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` are valid for the `EMAIL_USER` account.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
