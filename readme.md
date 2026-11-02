# Learning Room 🎓

> **Learn together, like sitting at the same table.**  
> A real-time collaborative virtual study room and interactive whiteboard platform designed for students, developers, and peer study groups.

---

## 🌟 Overview

**Learning Room** blends the focus of an intimate study space with the collaboration of a modern virtual classroom. Users can host instant or scheduled rooms, collaborate on a shared infinite canvas (Excalidraw), chat with peers, track personal study goals and to-dos, and explore public study communities across disciplines like Coding, Mathematics, Languages, and Design.

---

## 🏛️ System Architecture

Learning Room uses a decoupled client-server architecture with real-time bidirectional communication and serverless relational data storage:

```
┌───────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)                │
│   • Tailwind CSS v4             • Excalidraw Infinite Canvas │
│   • Socket.io-client WebSockets • Dual Theme System (Light/Dark)│
└───────────────────────────────┬───────────────────────────────┘
                                │ HTTP / REST & WebSockets
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                 Backend Server (Express 5 + TypeScript)       │
│   • Socket.io Room Orchestrator • JWT Auth with Secure Cookies│
│   • Google OAuth 2.0 Client     • Zod Request Validation     │
└───────────────────────────────┬───────────────────────────────┘
                                │ Prisma ORM 7 + WebSockets
                                ▼
┌───────────────────────────────────────────────────────────────┐
│              Neon Serverless PostgreSQL Database              │
│   • Users, Rooms, Goals, Participants, Activity History       │
└───────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
LearningRoom/
├── backend/                       # Express 5 + TypeScript REST & WebSocket API
│   ├── prisma/
│   │   └── schema.prisma         # PostgreSQL models, enums & relations
│   ├── src/
│   │   ├── config/               # Database pool & environment loader
│   │   ├── controllers/          # HTTP controllers (auth, room, user, goal)
│   │   ├── middlewares/          # JWT auth, error handling, rate limiting
│   │   ├── routes/v1/            # Versioned API routes
│   │   ├── services/             # Core business logic & database queries
│   │   ├── sockets/              # Socket.io connection, room & chat state
│   │   ├── types/                # TypeScript interfaces & declarations
│   │   ├── utils/                # Async handler, API error & token utilities
│   │   ├── validators/           # Zod input validation schemas
│   │   ├── app.ts                # Express application configuration
│   │   └── server.ts             # Server entrypoint (HTTP + Socket.io)
│   ├── tests/                    # Socket, room termination & goal test suites
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies and scripts
│   └── tsconfig.json             # TypeScript compiler settings
│
├── frontend/                      # React 19 + Vite SPA
│   ├── public/                   # Static assets, favicon, loader styles
│   ├── src/
│   │   ├── api/                  # Axios API client modules
│   │   ├── assets/               # Unified illustration & icon library
│   │   ├── components/
│   │   │   ├── canvas/           # Excalidraw real-time canvas integration
│   │   │   ├── chat/             # In-room live chat & system alerts
│   │   │   ├── common/           # Navbar, Footer, Theme toggle, Modal
│   │   │   ├── dashboard/        # Home, Activity, Explore, Settings, Goals
│   │   │   └── room/             # Room cards, headers, participant controls
│   │   ├── context/              # AuthContext (sessions, tokens, profile)
│   │   ├── pages/                # Landing (Home), Dashboard, Room, Login
│   │   ├── styles/               # Global CSS, theme variables, custom fonts
│   │   ├── App.jsx               # Route definitions & protected routes
│   │   └── main.jsx              # Application bootstrap
│   ├── .env.example              # Frontend environment template
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite build & local proxy configuration
│
├── .gitignore                     # Monorepo git ignore rules
├── AGENTS.md                      # Engineering standards & guidelines
└── README.md                      # System documentation
```

---

## ✨ Key Features

### 1. 🔐 Google OAuth 2.0 Authentication
* **Zero Passwords**: Seamless authentication powered exclusively by Google OAuth 2.0.
* **Persistent Sessions**: Secure HTTP-only cookies paired with signed JSON Web Tokens (JWT) for immediate client sync.
* **Resilient User Syncing**: Safe `findFirst` and upsert logic preventing duplicate subject ID crashes.

### 2. 🛋️ Collaborative Study Rooms
* **Dynamic Host System**: Every room creator dynamically receives host privileges (kick members, end meeting, toggle tools).
* **Private Knock & Approval**: Private rooms require an admission knock; hosts can accept or deny entry in real time.
* **Synchronized Termination**: When a host ends a room, all connected participants are gracefully notified and redirected.

### 3. 🎨 Real-time Infinite Whiteboard
* Built on top of **Excalidraw**, providing freehand drawing, geometric shapes, sticky notes, typography, and diagramming.
* State synchronization across peers using low-latency Socket.io broadcast channels.

### 4. 💬 Integrated Study Chat
* Real-time group messaging within rooms with participant avatars, timestamps, and automated join/leave system banners.

### 5. 🎯 Milestones & To-Do Goals
* Embedded goals widget allowing learners to set personal study targets, checklist tasks, and session goals saved in Neon PostgreSQL.
* One-click toggle between completed and active status with instant optimistic UI updates.

### 6. 🌓 Warm-Light & Dark Mode
* Carefully curated color palettes using CSS custom properties with seamless toggle transitions across all dashboard views.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Excalidraw, Socket.io-client, Axios, Lenis Smooth Scroll |
| **Backend** | Node.js, TypeScript, Express 5, Socket.io, Google Auth Library, Zod |
| **Database** | Neon Serverless PostgreSQL, Prisma ORM 7 (`@prisma/adapter-neon`) |
| **Auth** | Google OAuth 2.0, JWT (`jsonwebtoken`), Cookie-parser |
| **Testing** | Node / TSX test runners, custom socket integration harnesses |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.0.0` or higher (or **Bun** `v1.2+`)
* **Neon PostgreSQL**: Free serverless database connection string ([neon.tech](https://neon.tech))
* **Google Cloud Console**: OAuth 2.0 Client ID and Secret ([console.cloud.google.com](https://console.cloud.google.com))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/LearningRoom.git
cd LearningRoom
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration
Create `backend/.env` (or copy from `backend/.env.example`):
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Neon PostgreSQL Database
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<neon-host-unpooled>/neondb?sslmode=require"

# JWT Secrets
JWT_SECRET=supersecretjwtkey12345
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=supersecretrefreshkey12345
REFRESH_TOKEN_EXPIRES_IN=30d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

#### Frontend Configuration
Create `frontend/.env` (or copy from `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

### Step 3: Google Cloud Console Setup
In [Google Cloud Console &rarr; APIs & Services &rarr; Credentials](https://console.cloud.google.com/apis/credentials):
1. Select your **OAuth 2.0 Client ID**.
2. Under **Authorized JavaScript origins**, add:
   * `http://localhost:3000`
   * `http://localhost:5000`
3. Under **Authorized redirect URIs**, add:
   * `http://localhost:3000/api/v1/auth/google/callback`
   * `http://localhost:5000/api/v1/auth/google/callback`
4. Click **Save**.

---

### Step 4: Database Push & Setup
In the `backend/` directory:
```bash
cd backend
npm install
npx prisma db push
```

---

### Step 5: Start the Development Servers

Open two terminals:

**Terminal 1 — Backend API & WebSockets:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Available Scripts

### Backend (`/backend`)
* `npm run dev` — Starts the backend server with hot-reload via `tsx watch`.
* `npm run build` — Compiles TypeScript (`tsc --noEmit`).
* `npm run test:all` — Runs all socket, knock, termination, and goal tests.
* `npm run prisma:push` — Synchronizes schema changes with Neon PostgreSQL.
* `npm run prisma:studio` — Opens Prisma Studio database GUI.

### Frontend (`/frontend`)
* `npm run dev` — Starts Vite dev server on `http://localhost:3000`.
* `npm run build` — Builds production bundle to `frontend/dist`.
* `npm run preview` — Locally previews production build.

---

## 🗄️ Database Models

```prisma
model User {
  id           String   @id @default(uuid())
  googleId     String   @unique
  name         String
  email        String   @unique
  avatar       String?
  createdRooms Room[]   @relation("RoomCreator")
  joinedRooms  Room[]   @relation("RoomParticipants")
  goals        Goal[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Room {
  id               String       @id @default(uuid())
  roomCode         String       @unique
  title            String
  description      String?
  category         RoomCategory @default(STUDY)
  status           RoomStatus   @default(ACTIVE)
  isPrivate        Boolean      @default(false)
  creatorId        String
  creator          User         @relation("RoomCreator", fields: [creatorId], references: [id])
  participants     User[]       @relation("RoomParticipants")
  tools            Tool[]
  createdAt        DateTime     @default(now())
}

model Goal {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  category    String   @default("STUDY")
  targetCount Int      @default(1)
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 🛡️ Security & Best Practices
* **Least Privilege**: Tokens never expose passwords or sensitive internal IDs.
* **Environment Isolation**: `.env` and sensitive configurations are strictly excluded by `.gitignore`.
* **Input Validation**: All incoming REST payloads are verified against strict Zod schemas.
* **Resilient Database Fallbacks**: Automatic fallback handling during transient connection interruptions.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

