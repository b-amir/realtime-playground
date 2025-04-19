export const CONNECTION_CONFIG = {
  WEBSOCKET_URL:
    import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:3000/websocket",
  SOCKETIO_URL: import.meta.env.VITE_SOCKETIO_URL || "http://localhost:3000",
  SSE_URL: import.meta.env.VITE_SSE_URL || "http://localhost:3000/sse",
};
