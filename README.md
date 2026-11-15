# KNOT – Real-Time Text Messaging Application

<p align="center">
  <strong>Connecting people, one message at a time.</strong>
</p>

<p align="center">
  A lightweight real-time messaging application built with React, Electron, Node.js, Express, Socket.IO and PostgreSQL.
</p>

---

## About KNOT

KNOT is a real-time text messaging application designed to help registered users connect and communicate through a simple and responsive messaging experience.

The name **KNOT** represents the connection between people. Just as a knot brings separate strands together, KNOT brings users together through real-time communication.

The project focuses on essential messaging functionality, including secure authentication, conversation management, persistent message storage and real-time communication.

KNOT is developed as a modular desktop application using React and Electron, supported by a Node.js backend.

## Key Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Conversation Management:** Create and manage conversations between registered users.
- **Real-Time Messaging:** Send and receive messages instantly using Socket.IO.
- **Persistent Storage:** Store messages and conversation data in PostgreSQL.
- **Online/Offline Presence:** Track users' connection status.
- **Typing Indicators:** Know when another participant is typing.
- **Message Receipts:** Track SENT, DELIVERED and READ message statuses.
- **Socket Reconnection:** Handle connection interruptions and restore communication.
- **Desktop Application:** Access KNOT through an Electron-based desktop interface.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Desktop Framework | Electron |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Real-Time Communication | Socket.IO |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcryptjs |
| Version Control | Git, GitHub |

---

<p align="center">
  <strong>KNOT – Stay Connected. Stay in Sync.</strong>
</p>

## System Architecture

KNOT follows a modular client-server architecture.

```text
             KNOT DESKTOP APPLICATION
             ┌───────────────────────┐
             │       Electron        │
             │                       │
             │     React Frontend    │
             │                       │
             │  Authentication       │
             │  Chat Interface       │
             │  Conversation UI      │
             │  Presence Indicators  │
             └───────────┬───────────┘
                         │
                REST API / Socket.IO
                         │
             ┌───────────▼───────────┐
             │     Node.js Server   │
             │                       │
             │      Express.js      │
             │      JWT Middleware  │
             │      API Services    │
             │      Socket.IO       │
             └───────────┬───────────┘
                         │
                     Prisma ORM
                         │
             ┌───────────▼───────────┐
             │      PostgreSQL      │
             │                       │
             │        Users         │
             │     Conversations    │
             │       Messages       │
             └───────────────────────┘
```

### How It Works

1. Users interact with KNOT through the Electron desktop application.
2. React manages the application interface and user interactions.
3. Express handles authentication and REST API requests.
4. JWT verifies authenticated users.
5. Socket.IO handles real-time communication.
6. Prisma communicates with PostgreSQL to persist application data.

## Project Structure

```text
KNOT/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   └── server.js
│   ├── prisma/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

*Note: Adjust this structure to match the actual repository.*

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/siddhitripathi25/knot.git
cd knot
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5001
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/knot"
JWT_SECRET="your_secure_secret"
JWT_EXPIRES_IN="1d"
```

Replace the database credentials with your local PostgreSQL configuration.

Configure Prisma:

```bash
npx prisma generate
npx prisma migrate deploy
```

Start the backend:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd knot/client
npm install
```

Configure the frontend environment if required:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the application:

```bash
npm run dev
```

The Electron desktop window should open if the development scripts are configured correctly.

## Real-Time Communication

KNOT uses Socket.IO to enable bidirectional communication between connected users.

The real-time communication layer includes:

- Authenticated socket connections.
- Conversation-based communication rooms.
- Instant message sending and receiving.
- Online/offline presence updates.
- Typing start and stop events.
- Message delivery and read receipts.
- Reconnection and connection lifecycle management.

Socket connections use JWT-based authentication to associate communication events with authenticated users.

## Message Status Lifecycle

KNOT supports three message statuses:

| Status | Description |
|---|---|
| SENT | Message successfully persisted by the server. |
| DELIVERED | Message delivered to the recipient. |
| READ | Recipient has read the message. |

```text
SENT
  │
  ▼
DELIVERED
  │
  ▼
READ
```

## Development Roadmap

KNOT is organized into six major development phases:

| Phase | Focus Area |
|---|---|
| Phase 1 | Requirements and System Planning |
| Phase 2 | Database Design and Backend Foundation |
| Phase 3 | Authentication and Conversation Management |
| Phase 4 | Real-Time Communication Using Socket.IO |
| Phase 5 | Message Delivery and Receipt Management |
| Phase 6 | Frontend Development and Real-Time Integration |

Each phase is divided into smaller development tasks to support modular implementation and maintainable version control.

## Future Enhancements

Potential improvements for future versions include:

- Group conversations.
- Image and file sharing.
- Message editing and deletion.
- User profile customization.
- Push notifications.
- Message search.
- End-to-end encryption.

These are potential future enhancements and are not necessarily part of the current implementation.

## Contributors

KNOT is developed collaboratively as an academic major project.

The project involves collaborative contributions across application architecture, frontend development, backend development, database management and real-time communication.

## License

This project is developed for academic and educational purposes.

A formal open-source license can be added once the project team decides its distribution terms.

---

<p align="center">
  <strong>KNOT – Stay Connected. Stay in Sync.</strong>
</p>