# Financial Dashboard

![Financial Dashboard Screenshot](https://raw.githubusercontent.com/b-amir/realtime-playground/main/frontend/public/Screenshot-1.png)

This project demonstrates real-time financial data visualization using three different communication protocols: WebSocket, Socket.IO, and Server-Sent Events (SSE). It features a React frontend and an Express backend.

- **WebSocket**: Direct, low-latency, bi-directional communication (`ws` library).
- **Socket.IO**: Feature-rich WebSocket wrapper with fallbacks and additional features.
- **Server-Sent Events (SSE)**: Efficient one-way server-to-client communication.

## Project Structure

The project is a monorepo structure containing two main packages:

### Backend (`/backend`)

- **`src/`**:
  - **`config/`**: Environment variable management.
  - **`controllers/`**: Request handlers for API routes.
  - **`middleware/`**: Express middleware functions.
  - **`models/`**: Data structures or schemas (if any).
  - **`realtime/`**: Logic for WebSocket, Socket.IO, and SSE connections and data simulation.
  - **`routes/`**: API endpoint definitions (e.g., `/health`, `/sse`).
  - **`server/`**: Express server setup and graceful shutdown logic.
  - **`services/`**: Business logic or external service interactions.
  - **`utils/`**: Shared utility functions.
  - **`app.js`**: Main application setup, initializes server and services.
- **`index.js`**: Entry point for the backend application.
- **`package.json`**: Backend dependencies and scripts.
- **`package-lock.json`**: Exact dependency versions lockfile.
- **`.env`**: Local environment configuration (created from `.env.example`, gitignored).
- **`.env.example`**: Example environment variables.
- **`eslint.config.js`**: ESLint configuration.

### Frontend (`/frontend`)

- **`src/`**:
  - **`components/`**: Reusable React UI components (built with Shadcn UI/Radix).
  - **`config/`**: Frontend configuration (e.g., API URLs).
  - **`constants/`**: Shared constant values.
  - **`hooks/`**: Custom React hooks for state management and logic.
  - **`utils/`**: Utility functions specific to the frontend.
  - **`App.jsx`**: Main application component, orchestrates layout and views.
  - **`main.jsx`**: Entry point for the React application.
  - **`index.css`**: Global styles and Tailwind CSS setup.
- **`public/`**: Static assets.
- **`scripts/`**: Helper scripts (e.g., for component generation if using Shadcn CLI).
- **`index.html`**: Main HTML file for Vite.
- **`package.json`**: Frontend dependencies and scripts.
- **`vite.config.js`**: Vite build tool configuration.
- **`tailwind.config.js`**: Tailwind CSS configuration.
- **`postcss.config.js`**: PostCSS configuration.
- **`.env.example`**: Example environment variables for Vite.
- **`jsconfig.json`**: JavaScript configuration for IDEs.
- **`eslint.config.js`**: ESLint configuration.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation & Running

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/b-amir/realtime-playground.git
    cd realtime-playground
    ```
2.  **Set up Environment Variables**:

    - Copy `.env.example` to `.env` in both the `backend` and `frontend` directories.

    ```bash
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```

    - Modify the `.env` files if needed (e.g., ensure frontend URLs match the backend port).

3.  **Install Dependencies**: (Installs for both frontend and backend)

    ```bash
    npm run install:all
    ```

4.  **Start the Application**: (Starts both backend and frontend concurrently)

    ```bash
    npm start
    ```

5.  **Access the application**: Open your browser to `http://localhost:5173` (or the port specified by Vite).

## Features

- **Real-time Data Visualization**: View simulated stock price movements using Recharts.
- **Protocol Comparison**: Connect and disconnect individual WebSocket, Socket.IO, and SSE streams to compare behavior.
- **Connection Management**: UI toggles (using Radix UI Switch) to enable/disable specific connection types.
- **Transaction Logging**: Monitor connection events and data received from the server.
- **Responsive Design**: Tailwind CSS ensures usability across different screen sizes.
- **Error Handling**: Robust error handling for connection issues.
- **Auto-reconnection**: Attempts to reconnect dropped connections (built-in for Socket.IO, custom logic for others).
- **Backend Health Check**: `/health` endpoint for monitoring server status.
- **Graceful Shutdown**: Backend handles termination signals gracefully.
- **Dark Mode**: Frontend defaults to a dark theme.

## Tech Stack

### Backend

- Node.js, Express.js
- WebSocket (`ws` library)
- Socket.IO
- Dotenv for environment variables
- CORS

### Frontend

- React 18, Vite
- Recharts for charting
- Tailwind CSS for styling
- Shadcn UI / Radix UI for accessible components (Switch, etc.) - Note: Shadcn UI is used via its CLI to add components.
- Lucide Icons for UI icons
- Socket.IO Client
- `clsx`, `tailwind-merge` for class name management

### Development & Tooling

- ESLint for linting (separate configs for frontend/backend)
- Prettier for code formatting (frontend)
- Nodemon for backend hot-reloading
- Vitest & React Testing Library for frontend testing
- Vite Compression Plugin for build optimization

## Environment Variables

### Backend (`backend/.env`)

| Variable                    | Description                         | Default                 |
| --------------------------- | ----------------------------------- | ----------------------- |
| `PORT`                      | Server port                         | 3000                    |
| `CORS_ORIGIN`               | Allowed CORS origin                 | `http://localhost:5173` |
| `WEBSOCKET_UPDATE_INTERVAL` | Update interval for WebSocket in ms | 500                     |
| `SOCKETIO_UPDATE_INTERVAL`  | Update interval for Socket.IO in ms | 750                     |
| `SSE_UPDATE_INTERVAL`       | Update interval for SSE in ms       | 1000                    |

### Frontend (`frontend/.env`)

| Variable             | Description               | Default                         |
| -------------------- | ------------------------- | ------------------------------- |
| `VITE_WEBSOCKET_URL` | WebSocket server URL      | `ws://localhost:3000/websocket` |
| `VITE_SOCKETIO_URL`  | Socket.IO server URL      | `http://localhost:3000`         |
| `VITE_SSE_URL`       | SSE endpoint URL          | `http://localhost:3000/sse`     |
| `NODE_ENV`           | Node environment for Vite | `development`                   |

## Available Scripts

### Backend (`cd backend`)

- `npm run dev`: Starts the server in development mode using `nodemon` for auto-restarts.
- `npm run start`: Starts the server in production mode using `node`.
- `npm run lint`: Lints the backend codebase using ESLint.

### Frontend (`cd frontend`)

- `npm run dev`: Starts the Vite development server with hot module replacement (HMR).
- `npm run build`: Builds the production-ready application to the `dist/` folder.
- `npm run preview`: Serves the production build locally for previewing.
- `npm run lint`: Lints the frontend codebase using ESLint.
- `npm run format`: Formats code using Prettier.
- `npm run test`: Runs unit/integration tests using Vitest once.
- `npm run test:watch`: Runs tests in watch mode.

## Building for Production

### Backend

```bash
cd backend
# Ensure environment variables are set appropriately for production
npm install --omit=dev # Install only production dependencies
npm run start
```

### Frontend

```bash
cd frontend
# Ensure VITE_* environment variables point to the production backend URL
npm install
npm run build
# Deploy the contents of the 'dist' folder to your hosting provider
# Or use 'npm run preview' to test the build locally
npm run preview
```
