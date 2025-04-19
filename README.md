# Realtime Playground

![Financial Dashboard Screenshot](https://raw.githubusercontent.com/b-amir/realtime-playground/main/frontend/public/Screenshot-1.png)

This project demonstrates real-time financial data visualization using three different communication protocols: WebSocket, Socket.IO, and Server-Sent Events (SSE). Compare them side-by-side!

- **WebSocket (`ws`)**: 🚀 Direct, low-latency, bi-directional.
- **Socket.IO**: ✨ Feature-rich wrapper with fallbacks.
- **Server-Sent Events (SSE)**: unidirectional (server-to-client).

## 🏗️ Project Structure

This is an [Nx](https://nx.dev) monorepo using npm workspaces. It contains two main packages:

- **`backend/`**: Node.js/Express server handling data simulation and real-time communication.
- **`frontend/`**: React/Vite client application for visualizing data and managing connections.

Nx manages task running (like starting, building, linting) across the packages.

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

- Nx, npm Workspaces
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

    - Adjust URLs/ports if needed (defaults should work, backend uses 3001, frontend uses 5173).

3.  **Install Dependencies** (from root):

    ```bash
    npm install
    ```

    _(This uses npm workspaces to install for both packages)_

4.  **Start Both Servers** (from root):

    ```bash
    npm start
    ```

    _(This uses `nx run-many --target=dev`)_

5.  **Access**: Open your browser to `http://localhost:5173` (or the port Vite specifies).

## ⚙️ Configuration

- Environment variables control ports, origins, and update intervals. See the `.env.example` files in `backend/` and `frontend/` for details.

## ▶️ Available Scripts (Run from Root)

Nx handles running tasks defined in `project.json` for each package.

- `npm start`: Starts both backend (`dev`) and frontend (`dev`) concurrently.
- `npm run server`: Starts only the backend (`dev`).
- `npm run client`: Starts only the frontend (`dev`).
- `npm run build`: Builds both backend and frontend (if build targets exist).
- `npm run lint`: Lints both backend and frontend.
- `npm run test`: Runs tests for both backend and frontend (if test targets exist).

_Individual package scripts (like `format` in frontend) can still be run by navigating to the package directory (`cd frontend`) and running `npm run <script_name>`._
