# Realtime Playground

![Financial Dashboard Screenshot](https://raw.githubusercontent.com/b-amir/realtime-playground/main/frontend/public/Screenshot-1.png)

This project demonstrates real-time financial data visualization using three different communication protocols: WebSocket, Socket.IO, and Server-Sent Events (SSE). Compare them side-by-side!

- **WebSocket (`ws`)**: 🚀 Direct, low-latency, bi-directional.
- **Socket.IO**: ✨ Feature-rich wrapper with fallbacks.
- **Server-Sent Events (SSE)**: unidirectional (server-to-client).

## 🏗️ Project Structure

This is a monorepo containing two main packages:

- **`backend/`**: Node.js/Express server handling data simulation and real-time communication via WS, Socket.IO, and SSE.
- **`frontend/`**: React/Vite client application for visualizing the data and managing connections.

## ✨ Features

- **📊 Real-time Data Viz**: View simulated stock price movements using Recharts.
- **↔️ Protocol Comparison**: Connect/disconnect streams individually.
- **🎛️ Connection Toggles**: Easy UI controls for each protocol.
- **📝 Transaction Logging**: Monitor connection events and data flow.
- **📱 Responsive Design**: Built with Tailwind CSS.
- **🔌 Auto-reconnection**: Attempts to reconnect dropped connections.
- **❤️ Health Check**: Backend `/health` endpoint.

## 🛠️ Tech Stack

**Backend:**

- Node.js, Express.js
- WebSocket (`ws`), Socket.IO
- Dotenv, CORS

**Frontend:**

- React 18, Vite
- Recharts 📈
- Tailwind CSS, Shadcn UI / Radix UI 🎨
- Socket.IO Client
- Lucide Icons ✨

**Development:**

- ESLint, Prettier, Nodemon, Vitest

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation & Running

1.  **Clone**:
    ```bash
    git clone https://github.com/b-amir/realtime-playground.git
    cd realtime-playground
    ```
2.  **Setup Environment**:

    - Copy `.env.example` to `.env` in both `backend` and `frontend`.

    ```bash
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```

    - Adjust URLs/ports in `.env` files if necessary (defaults should work).

3.  **Install & Start**:

    ```bash
    npm run install:all && npm start
    ```

    This installs dependencies for both packages and starts backend & frontend concurrently.

4.  **Access**: Open your browser to `http://localhost:5173` (or the port Vite specifies).

## ⚙️ Configuration

- Environment variables control ports, origins, and update intervals. See the `.env.example` files in `backend/` and `frontend/` for details.

## ▶️ Available Scripts

- **Root**:
  - `npm run install:all`: Installs all dependencies.
  - `npm start`: Starts backend and frontend concurrently.
- **Backend (`cd backend`)**:
  - `npm run dev`: Start in dev mode (nodemon).
  - `npm start`: Start in production mode.
  - `npm run lint`: Lint code.
- **Frontend (`cd frontend`)**:
  - `npm run dev`: Start Vite dev server.
  - `npm run build`: Build for production.
  - `npm run preview`: Preview production build.
  - `npm run lint`: Lint code.
  - `npm run format`: Format code.
  - `npm test`: Run tests.
