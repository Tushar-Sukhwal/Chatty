# Chatty – Real-time Chat Application

Chatty is a **full-stack, real-time messaging platform** that demonstrates how to build a modern chat experience with the latest web tooling.

* **Frontend** – Next.js 15 (App Router) + React 19, Tailwind CSS & ShadCN-UI, Zustand state-store, Socket.IO client.
* **Backend** – Node.js (TypeScript) + Express 5, Socket.IO, MongoDB (Mongoose), Redis, Kafka, Firebase Admin & JWT authentication.

> This repository is split into two workspaces – `client/` (Next.js) and `server/` (Express API). Both can be developed independently or started together.

---

## Table of contents

1. [Architecture & folder structure](#architecture--folder-structure)
2. [Features](#features)
3. [Demo GIF](#demo)
4. [Getting started](#getting-started)
   * [Prerequisites](#prerequisites)
   * [Environment variables](#environment-variables)
   * [Installation](#installation)
   * [Running in development](#running-in-development)
   * [Building for production](#building-for-production)
5. [Backend API](#backend-api)
6. [WebSocket contract](#websocket-contract)
7. [Tech-stack details](#tech-stack-details)
8. [Project scripts](#project-scripts)
9. [Contributing](#contributing)
10. [License](#license)

---

## Architecture & folder structure

```
chatty-final/
 ├─ client/              # Next.js 15 app (React 19)
 │   ├─ src/
 │   │   ├─ api/         # Axios wrappers for REST endpoints
 │   │   ├─ app/         # Next.js App router routes (+layout.tsx)
 │   │   ├─ components/  # Reusable UI & feature components
 │   │   ├─ hooks/       # Custom React hooks
 │   │   ├─ services/    # Front-end only services (eg. SocketSingleton)
 │   │   ├─ store/       # Zustand state stores
 │   │   └─ types/       # Shared TS types
 │   └─ public/          # Static assets / favicons
 │
 └─ server/              # Express 5 REST & Socket.IO server
     ├─ src/
     │   ├─ config/      # Mongo, Redis, Kafka, Firebase config helpers
     │   ├─ controllers/ # Express route handlers
     │   ├─ middleware/  # HTTP & Socket authentication middlewares
     │   ├─ models/      # Mongoose schemas (User, Chat, Message)
     │   ├─ routes/      # Express routers (auth, chat, message, user)
     │   ├─ services/    # Internal services (socket, redis, kafka)
     │   ├─ types/       # Custom TS type declarations
     │   └─ index.ts     # Entry – creates HTTP + Socket.IO server
     └─ .env.example     # Example environment variables (see below)
```

Both workspaces are isolated Node projects with their own `package.json`, `tsconfig.json` and lock-files.  Each can therefore be installed, tested and deployed separately.

---

## Features

### Realtime messaging
* **Direct & group chats** – chats are stored in MongoDB via the `Chat` model.
* **Statuses** – `sent`, `delivered`, `read` handled by the backend and pushed via Socket.IO.
* **Message actions** – edit, reply-to, delete-for-me / delete-for-everyone.
* **Online presence** – Redis keeps a lightweight mapping of `userId ↔ socketId` and handles online / offline events.

### Authentication
* Sign-up & login via REST (`/api/auth/*`) issuing JWT tokens (stored only in memory + Zustand persisted store on the client).
* Firebase Admin integration left ready for push-notifications (FCM) – no client SDK required.

### Modern UI/UX
* Built with **ShadCN-UI** primitives + Tailwind 4.
* Mobile-responsive layout (sidebar collapses, bottom tabs, etc.).
* Accessible – Radix-UI under the hood.

### Scalability & observability
* Stateless Socket.IO nodes (user ↔ socket affinity managed in Redis).
* **Kafka** integration sketched for eventually consistent, micro-service events (eg. archiving, analytics).
* Winston + daily-rotate-file logging.

---

## Demo

Add a GIF / link here once deployed.

---

## Getting started

### Prerequisites

* **Node.js ≥ 20**  (check with `node -v`)
* **npm ≥ 10** or **pnpm ≥ 8** (yarn also works)
* **MongoDB** running locally (or Atlas connection string)
* **Redis** (≥ 6.x) – required for presence; local install works fine
* **Kafka** (optional) – only needed if you want to test the Kafka flow

### Environment variables

Create the following files and update the placeholders:

#### `server/.env`
```bash
PORT=3000
DATABASE_URL=mongodb://localhost:27017/chatty
JWT_SECRET=super-secret-key
NODE_ENV=development

# Redis (only used when NODE_ENV=production, otherwise localhost:6379 is assumed)
REDIS_URL=redis://:<password>@redis-host:6379

# Kafka (optional)
KAFKA_TOPIC=chatty

# Firebase (optional – required only if you keep `firebase.config.ts` enabled)
GOOGLE_APPLICATION_CREDENTIALS=src/config/firebase-service.json
```

#### `client/.env.local`
```bash
# URL where the Express API + Socket.IO server is reachable
NEXT_PUBLIC_API_URL=http://localhost:3000
```
> Feel free to use a different port – just make sure the value matches on both sides.

### Installation

Install dependencies for both workspaces:

```bash
# at repo root
npm install            # this will **not** install workspace deps

# install server deps
cd server && npm install

# install client deps
cd ../client && npm install
```

### Running in development

Open two terminals:

```bash
# Terminal 1 – backend
cd server
npm run dev            # tsx watch src/index.ts (nodemon-like)

# Terminal 2 – frontend
cd client
npm run dev            # next dev (➡ http://localhost:3001 by default)
```

The Next.js dev server will automatically proxy API & WebSocket requests to `NEXT_PUBLIC_API_URL`.  If you run the client on a different port remember to set CORS on the backend or use a reverse proxy.

> You can also run both with **concurrently** (optional):
>
> ```bash
> npm install -g concurrently
> concurrently "npm --prefix server run dev" "npm --prefix client run dev"
> ```

### Building for production

```bash
# Build server
cd server && npm run build     # emits to server/dist

# Build client
cd ../client && npm run build
```

Dockerfiles / docker-compose are not provided yet but PRs are welcome.

---

## Backend API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | `/api/auth/register` | Create new user |
| POST   | `/api/auth/login`    | Obtain JWT token |
| GET    | `/api/user/me`       | Current user profile (requires `Authorization: Bearer <token>`) |
| GET    | `/api/user/online-users` | Array of `userId` currently online |
| POST   | `/api/user/add-user-to-friends/:email` | Add user to friends list |
| GET    | `/api/user/get-user-by-username-or-email/:query` | Search users |
| GET    | `/api/chat/:chatId/messages` | List messages for a chat |
| etc…. |  | See route files under `server/src/routes/*` for the full reference |

All endpoints return JSON in the following envelope:

```json
{
  "status": "success",
  "data": { /* payload */ }
}
```

---

## WebSocket contract

The client uses a **singleton** Socket.IO instance (`SocketSingleton` in `client/src/services/socketService.tsx`).  Below are the primary events exchanged between client ↔ server:

| Direction | Event | Payload |
|-----------|-------|---------|
| → server  | `sendMessage` | `{ chatId, senderId, content, createdAt, [replyToMessageId] }` |
| ← client  | `newMessage`  | `Message` model sent to all chat participants |
| → server  | `editMessage` | `{ messageId, content }` |
| ← client  | `updateEditMessage` | Updated `Message` object |
| → server  | `deleteMessage` | `{ messageId }` |
| ← client  | `updateDeleteMessage` | Acknowledgement / updated message |
| ← client  | `online`  | `userId` came online |
| ← client  | `offline` | `userId` went offline |

See `server/src/services/socket.service.ts` for the full, authoritative contract.

---

## Tech-stack details

### Frontend
* **Next.js 15** App Router + React Server Components
* **React 19** with the new async transitions
* **Tailwind CSS 4** & **shadcn-ui** component build script
* **Zustand** for global state (persisted via `localStorage`)
* **React-Hook-Form** + **Zod** for forms & validation
* **Socket.IO client** for websockets

### Backend
* **Express 5** with typed controllers & routes
* **Socket.IO** (`initializeSocket`) for bi-directional messaging
* **MongoDB** (Mongoose models for User / Chat / Message)
* **Redis** (`ioredis`) – online presence, quick lookups
* **KafkaJS** – event-streaming placeholder (toggle off/on easily)
* **Firebase Admin** – ready for FCM notifications
* **Winston** logging (daily rotate files)

---

## Project scripts

Run from each workspace unless stated otherwise:

| Workspace | Script | Action |
|-----------|--------|--------|
| `client`  | `npm run dev`   | Start Next.js dev server |
|           | `npm run build` | Build production bundle |
|           | `npm run start` | Start production server |
| `server`  | `npm run dev`   | Start Express + Socket.IO with live reload (`tsx watch`) |
|           | `npm run build` | Transpile TypeScript to `dist/` |
|           | `npm run start` | Build & run production server |

---

## Contributing

1. Fork & clone the repo
2. `git checkout -b feat/my-feature`
3. Commit following [Conventional Commits](https://www.conventionalcommits.org/) style
4. Push and open a Pull Request – remember to describe **why** the change is useful 💡

Bug reports are equally welcome – please include reproduction steps.

---

## License

Distributed under the **MIT License**.  See `LICENSE` for more information. 