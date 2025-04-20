import { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { CONNECTION_CONFIG } from "@/config/connection";
function getBrowserSessionId() {
  let sessionId = localStorage.getItem("browserSessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("browserSessionId", sessionId);
    console.log("Generated new browser session ID:", sessionId);
  }
  return sessionId;
}
export function useConnectionManager(
  connectionStatus,
  addLog,
  updateChartData,
  onTradingLog,
  onClientIdSet
) {
  const wsRef = useRef(null);
  const sseRef = useRef(null);
  const socketRef = useRef(null);
  const effectRan = useRef(false);
  const browserSessionId = useRef(getBrowserSessionId());
  const reconnectAttempt = useRef(0);
  const reconnectTimeoutId = useRef(null);
  const MAX_RECONNECT_DELAY = 30000; 
  const INITIAL_RECONNECT_DELAY = 1000; 
  const transactionCounters = useRef({
    websocket: 0,
    socketio: 0,
    sse: 0,
  });
  const transactionLogIds = useRef({
    websocket: null,
    socketio: null,
    sse: null,
  });
  const latestOnTradingLog = useRef(onTradingLog);
  useEffect(() => {
    latestOnTradingLog.current = onTradingLog;
  }, [onTradingLog]);
  const handleServerInfo = useCallback(
    (data, protocol) => {
      if (data && data.type === "server_info") {
        switch (data.eventType) {
          case "server_start":
            addLog(
              `Server started: ${data.data.hostname} (${data.data.nodeVersion})`,
              "success",
              "global"
            );
            break;
          case "server_shutdown":
            addLog(
              `Server is shutting down after ${data.data.uptime} seconds of uptime`,
              "warning",
              "global"
            );
            break;
          case "connection": {
            const clientInfo = data.data.client;
            addLog(
              `New ${data.data.protocol} client connected: ${clientInfo.id}${clientInfo.ip ? ` (IP: ${clientInfo.ip})` : ""}`,
              "info",
              data.data.protocol
                .toLowerCase()
                .replace(".", "")
                .replace(/\s+/g, "")
            );
            break;
          }
          case "disconnection": {
            const disconnectedClient = data.data.client;
            addLog(
              `${data.data.protocol} client disconnected: ${disconnectedClient.id} - Reason: ${data.data.reason || "Unknown"}`,
              "warning",
              data.data.protocol
                .toLowerCase()
                .replace(".", "")
                .replace(/\s+/g, "")
            );
            break;
          }
          case "connection_error":
            addLog(
              `${data.data.protocol} connection error: ${data.data.error}`,
              "error",
              data.data.protocol
                .toLowerCase()
                .replace(".", "")
                .replace(/\s+/g, "")
            );
            break;
          case "upgrade_rejected":
            addLog(
              `Connection upgrade rejected: ${data.data.path} - ${data.data.reason}`,
              "error",
              "global"
            );
            break;
          case "connection_success": {
            if (protocol && protocol !== data.data.protocol.toLowerCase()) {
              return;
            }
            if (protocol === "websocket") {
              reconnectAttempt.current = 0; 
              if (reconnectTimeoutId.current) {
                clearTimeout(reconnectTimeoutId.current);
                reconnectTimeoutId.current = null;
              }
            }
            const clientInfo = data.data.client;
            const userId = clientInfo?.id;
            const assignedRole = clientInfo?.role;
            if (userId && onClientIdSet) {
              onClientIdSet(userId);
            }
            let logMessage = data.data.message;
            if (userId && assignedRole) {
              logMessage = `Connected to ${data.data.protocol} (${userId} as ${assignedRole})`;
            } else if (userId) {
              logMessage = `Connected to ${data.data.protocol} (${userId})`;
            }
            addLog(logMessage, "success", data.data.protocol.toLowerCase());
            break;
          }
          default:
            break;
        }
      }
    },
    [addLog, onClientIdSet]
  );
  const addTransactionLog = useCallback((method) => {
    transactionCounters.current[method]++;
  }, []);
  const closeConnection = useCallback(
    (type) => {
      switch (type) {
        case "websocket":
          if (reconnectTimeoutId.current) {
            clearTimeout(reconnectTimeoutId.current);
            reconnectTimeoutId.current = null;
            reconnectAttempt.current = 0;
            addLog(
              "WebSocket reconnection cancelled (manual close)",
              "info",
              "websocket"
            );
          }
          if (wsRef.current) {
            wsRef.current.close(1000, "Client closed connection");
            addLog(
              "WebSocket connection closed (toggled off)",
              "info",
              "websocket"
            );
            wsRef.current = null;
            transactionCounters.current.websocket = 0;
            transactionLogIds.current.websocket = null;
          }
          break;
        case "socketio":
          {
            if (socketRef.current) {
              socketRef.current.disconnect();
              addLog(
                "Socket.IO connection closed (toggled off)",
                "info",
                "socketio"
              );
              socketRef.current = null;
              transactionCounters.current.socketio = 0;
              transactionLogIds.current.socketio = null;
            }
          }
          break;
        case "sse":
          {
            if (sseRef.current) {
              sseRef.current.close();
              addLog("SSE connection closed (toggled off)", "info", "sse");
              sseRef.current = null;
              transactionCounters.current.sse = 0;
              transactionLogIds.current.sse = null;
            }
          }
          break;
        default:
          break;
      }
    },
    [addLog]
  );
  const setupWebSocket = useCallback(() => {
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
      reconnectTimeoutId.current = null;
    }
    if (wsRef.current) return;
    addLog("Connecting to WebSocket server...", "info", "websocket");
    let url = CONNECTION_CONFIG.WEBSOCKET_URL;
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}browserSessionId=${browserSessionId.current}`;
    addLog(
      `Attempting WebSocket connection with session ID: ${browserSessionId.current}...`,
      "info",
      "websocket"
    );
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      window.ws = ws;
      ws.onopen = () => {
        reconnectAttempt.current = 0; 
        if (wsRef.current === ws) {
          addLog("Connected to WebSocket server", "success", "websocket");
        }
      };
      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            addLog(
              `Received binary data: ${reader.result}`,
              "binary",
              "websocket"
            );
          };
          reader.readAsText(event.data);
        } else {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "trading_log" && onTradingLog) {
              onTradingLog(data.data, "websocket");
              return;
            }
            if (data.type === "large_message") {
              addLog(
                `Received large message test (${data.size} bytes): ${data.message}`,
                "info",
                "websocket"
              );
              return;
            }
            if (data.type === "server_info") {
              handleServerInfo(data, "websocket");
            } else if (data.stock === "websocket") {
              updateChartData(data);
              addTransactionLog("websocket");
            }
          } catch (error) {
            addLog(
              `Error parsing WebSocket message: ${error.message}`,
              "error",
              "websocket"
            );
          }
        }
      };
      ws.onping = () => {
        addLog("Received ping from server", "info", "websocket");
      };
      ws.onpong = () => {
        addLog("Sent pong to server", "info", "websocket");
      };
      ws.onclose = (event) => {
        const wasConnected = wsRef.current === ws;
        if (wsRef.current === ws) {
          wsRef.current = null;
          window.ws = null;
        }
        const reason = event.reason || "No reason provided";
        const code = event.code;
        addLog(
          `Disconnected from WebSocket server (Code: ${code}, Reason: ${reason})`,
          "warning",
          "websocket"
        );
        if (wasConnected) {
          const delay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempt.current),
            MAX_RECONNECT_DELAY
          );
          reconnectAttempt.current++;
          addLog(
            `WebSocket disconnected unexpectedly. Attempting reconnect #${reconnectAttempt.current} in ${delay / 1000}s...`,
            "warning",
            "websocket"
          );
          reconnectTimeoutId.current = setTimeout(() => {
            if (connectionStatus.websocket) {
              addLog(
                `Executing reconnect attempt #${reconnectAttempt.current}...`,
                "info",
                "websocket"
              );
              setupWebSocket();
            }
          }, delay);
        }
      };
      ws.onerror = (error) => {
        addLog(
          `WebSocket error: ${error.message || "Connection error"}`,
          "error",
          "websocket"
        );
        if (wsRef.current === ws) {
        }
      };
    } catch (error) {
      addLog(
        `Failed to create WebSocket connection: ${error.message}`,
        "error",
        "websocket"
      );
    }
  }, [
    connectionStatus,
    addLog,
    updateChartData,
    addTransactionLog,
    handleServerInfo,
    onTradingLog,
    browserSessionId,
  ]);
  const connectSocketIO = useCallback(() => {
    if (socketRef.current) {
      return () => {};
    }
    addLog("Connecting to Socket.IO server...", "info", "socketio");
    const connectionQuery = { browserSessionId: browserSessionId.current };
    addLog(
      `Attempting Socket.IO connection with session ID: ${browserSessionId.current}...`,
      "info",
      "socketio"
    );
    const newSocket = io(CONNECTION_CONFIG.SOCKETIO_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      query: connectionQuery,
    });
    if (window.socket) {
      console.warn(
        "[socketio] Warning: Overwriting existing window.socket",
        window.socket.id
      );
    }
    window.socket = newSocket;
    console.log("[socketio] Set window.socket on initialization");
    socketRef.current = newSocket;
    newSocket.on("connect", () => {
      if (socketRef.current === newSocket) {
        addLog("Socket.IO connection established", "success", "socketio");
        if (window.socket !== newSocket) {
          console.log("[socketio] Resetting window.socket on connect");
          window.socket = newSocket;
        }
        console.log("[socketio] Connected:", {
          socketRefId: socketRef.current.id,
          windowSocketId: window.socket?.id,
        });
      }
    });
    newSocket.on("server_info", (info) => {
      if (socketRef.current !== newSocket) return;
      handleServerInfo(info, "socketio");
    });
    newSocket.on("connect_error", (err) => {
      addLog(
        `Socket.IO connection error: ${err.message} (Type: ${err.type}, Description: ${err.description})`,
        "error",
        "socketio"
      );
    });
    newSocket.on("disconnect", (reason) => {
      if (socketRef.current !== newSocket) return;
      addLog(`Disconnected from Socket.IO: ${reason}`, "warn", "socketio");
      if (window.socket === newSocket) {
        console.log("[socketio] Clearing window.socket on disconnect");
        window.socket = null;
      }
      socketRef.current = null;
    });
    newSocket.on("trading_log", (log) => {
      if (socketRef.current !== newSocket) {
        return;
      }
      if (latestOnTradingLog.current) {
        latestOnTradingLog.current(log, "socketio");
      }
    });
    newSocket.on("trading_log_history", () => {});
    newSocket.on("stockUpdate", (data) => {
      if (socketRef.current === newSocket) {
        try {
          if (data.stock === "socketio") {
            updateChartData(data);
            addTransactionLog("socketio");
          }
        } catch (error) {
          addLog(
            `Error processing Socket.IO message: ${error.message}`,
            "error",
            "socketio"
          );
        }
      }
    });
    return () => {
      if (window.socket === newSocket) {
        console.log("[socketio] Clearing window.socket in cleanup");
        window.socket = null;
      }
      if (socketRef.current === newSocket) {
        addLog("Cleaning up Socket.IO connection...", "info", "socketio");
        newSocket.disconnect();
        socketRef.current = null;
      }
    };
  }, [
    addLog,
    addTransactionLog,
    handleServerInfo,
    updateChartData,
    browserSessionId,
  ]);
  const setupSSE = useCallback(() => {
    if (sseRef.current) return;
    addLog("Connecting to SSE server...", "info", "sse");
    let url = CONNECTION_CONFIG.SSE_URL;
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}browserSessionId=${browserSessionId.current}`;
    addLog(
      `Attempting SSE connection with session ID: ${browserSessionId.current}...`,
      "info",
      "sse"
    );
    try {
      const sse = new EventSource(url);
      sseRef.current = sse;
      sseRef.current.handlingError = false;
      sse.onopen = () => {
        if (sseRef.current === sse) {
          addLog("Connected to SSE server", "success", "sse");
        }
      };
      sse.onerror = (error) => {
        if (!sseRef.current?.handlingError) {
          if (sse.readyState === EventSource.CLOSED) {
            addLog("SSE connection closed by server", "error", "sse");
          } else if (sse.readyState === EventSource.CONNECTING) {
            addLog("SSE reconnecting...", "warning", "sse");
          } else {
            addLog(
              `SSE connection error: ${error.message || "Unknown error"}`,
              "error",
              "sse"
            );
          }
        }
      };
      sse.addEventListener("connection", (event) => {
        const data = JSON.parse(event.data);
        addLog(`Connection event: ${JSON.stringify(data)}`, "info", "sse");
      });
      sse.addEventListener("connection_success", (event) => {
        const data = JSON.parse(event.data);
        addLog(
          `Successfully connected to SSE (${data.client.id})`,
          "success",
          "sse"
        );
      });
      sse.addEventListener("connection_error", (event) => {
        const data = JSON.parse(event.data);
        addLog(`Connection error: ${data.message}`, "error", "sse");
      });
      sse.addEventListener("custom", (event) => {
        const data = JSON.parse(event.data);
        addLog(`Custom event: ${JSON.stringify(data)}`, "info", "sse");
      });
      sse.addEventListener("error", (event) => {
        sseRef.current.handlingError = true;
        const data = JSON.parse(event.data);
        addLog(`Server error event: ${data.message}`, "error", "sse");
        setTimeout(() => {
          sseRef.current.handlingError = false;
        }, 100);
      });
      sse.onmessage = (event) => {
        if (sseRef.current === sse) {
          try {
            const data = JSON.parse(event.data);
            if (data.stock === "sse") {
              updateChartData(data);
              addTransactionLog("sse");
            }
          } catch (error) {
            addLog(
              `Error parsing SSE message: ${error.message}`,
              "error",
              "sse"
            );
          }
        }
      };
      sse.addEventListener("server_info", (event) => {
        if (sseRef.current === sse) {
          try {
            const data = JSON.parse(event.data);
            handleServerInfo(data, "sse");
          } catch (error) {
            addLog(
              `Error parsing SSE server info: ${error.message}`,
              "error",
              "sse"
            );
          }
        }
      });
      sse.addEventListener("trading_log", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onTradingLog) {
            onTradingLog(data, "sse");
          }
        } catch (error) {
          addLog(
            `Error parsing SSE trading log: ${error.message}`,
            "error",
            "sse"
          );
        }
      });
    } catch (error) {
      addLog(
        `Failed to create SSE connection: ${error.message}`,
        "error",
        "sse"
      );
    }
  }, [
    addLog,
    updateChartData,
    addTransactionLog,
    handleServerInfo,
    onTradingLog,
    browserSessionId,
  ]);
  const handleOnline = useCallback(() => {
    addLog("Network connection restored", "success", "global");
    if (connectionStatus.websocket) {
      setupWebSocket();
    } else {
      closeConnection("websocket");
    }
    if (connectionStatus.socketio) {
      connectSocketIO();
    } else {
      closeConnection("socketio");
    }
    if (connectionStatus.sse) {
      setupSSE();
    } else {
      closeConnection("sse");
    }
  }, [
    connectionStatus,
    addLog,
    setupWebSocket,
    connectSocketIO,
    setupSSE,
    closeConnection,
  ]);
  const handleOffline = useCallback(() => {
    addLog("Network connection lost", "warning", "global");
  }, [addLog]);
  useEffect(() => {
    if (effectRan.current === true || import.meta.env.MODE !== "development") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      if (connectionStatus.websocket) {
        setupWebSocket();
      } else {
        closeConnection("websocket");
      }
      if (connectionStatus.socketio) {
        connectSocketIO();
      } else {
        closeConnection("socketio");
      }
      if (connectionStatus.sse) {
        setupSSE();
      } else {
        closeConnection("sse");
      }
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
    return () => {
      effectRan.current = true;
      closeConnection("websocket");
      closeConnection("socketio");
      closeConnection("sse");
    };
  }, [
    connectionStatus,
    addLog,
    setupWebSocket,
    connectSocketIO,
    setupSSE,
    closeConnection,
    handleOnline,
    handleOffline,
  ]);
  useEffect(() => {
    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      closeConnection("websocket");
      closeConnection("socketio");
      closeConnection("sse");
    };
  }, []);
  return {};
}
