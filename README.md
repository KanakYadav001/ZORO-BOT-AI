# Zoro AI - Modern Real-Time RAG AI Chat Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-010101?logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-v6.0+-47A248?logo=mongodb)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_Database-000000)
![Groq](https://img.shields.io/badge/Groq-LLM_Inference-F05032)

**Zoro AI** is a full-stack, enterprise-grade AI conversation platform featuring real-time WebSocket communication, vector-based Retrieval-Augmented Generation (RAG) powered by Pinecone & Groq LLM, and a sleek, minimalist UI inspired by Linear, Raycast, and ChatGPT.

---

## 🌟 Key Features

- **⚡ Real-Time Streaming AI Responses**: Low-latency WebSocket messaging via Socket.IO.
- **🧠 Vector RAG Memory**: Generates semantic embeddings for user conversations and queries Pinecone vector database for contextual memory retrieval before invoking the Groq LLM.
- **🔐 Robust Authentication**: Secure user registration, login, and token session management powered by JWT & HTTP cookies.
- **🎨 Minimalist Linear-Style UI**: Ultra-clean interface supporting both Light & Dark themes, responsive layout, smooth Framer Motion animations, and code snippet formatting with one-click copy.
- **💬 Conversation History Management**: Create, search, switch, and delete chat sessions.
- **📊 User Profile & Metrics**: Profile management displaying user stats and membership details.
- **⚡ Asynchronous Queue Processing**: Integrated RabbitMQ message broker for backend event handling.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + Geist / Inter Typography
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **WebSockets**: Socket.IO Client

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB (Mongoose ORM)
- **Vector DB**: Pinecone Vector Database (`@pinecone-database/pinecone`)
- **AI Inference**: Groq SDK (`groq-sdk`) + HuggingFace Embeddings
- **Message Queue**: RabbitMQ (`amqplib`)
- **Authentication**: JSON Web Tokens (JWT) + Bcryptjs + Cookie Parser

---

## 📁 Repository Structure

```
Zoro-Ai-New/
├── backend/
│   ├── server.js              # Server entry point
│   ├── src/
│   │   ├── app.js             # Express application configuration
│   │   ├── controller/        # User and Chat HTTP controllers
│   │   ├── db/                # MongoDB connection setup
│   │   ├── middleware/        # JWT Authentication middleware
│   │   ├── models/            # Mongoose Schemas (User, Chat, Message)
│   │   ├── routers/           # API routes (/api/auth, /api/chat)
│   │   ├── service/           # Groq AI & Pinecone vector services
│   │   ├── socket/            # Socket.IO WebSocket server logic
│   │   └── broker/            # RabbitMQ broker & queue listener
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components (AuthPage, ChatInterface, Sidebar, UserProfilePage)
│   │   ├── services/          # REST API client
│   │   ├── App.jsx            # Core application orchestration
│   │   ├── main.jsx           # React DOM root entry
│   │   └── index.css          # Tailwind CSS v4 design system
│   ├── vite.config.js         # Vite configuration with API proxy & Tailwind v4
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB database URI
- Pinecone API Key & Environment
- Groq API Key

### 1. Environment Configuration

Create a `.env` file inside the `backend/` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
RABBITMQ_URL=amqp://localhost
```

### 2. Backend Installation & Run

```bash
cd backend
npm install
node server.js
```

### 3. Frontend Installation & Run

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
