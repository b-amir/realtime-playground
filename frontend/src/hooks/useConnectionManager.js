import { useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useWebSocketConnection } from "./useWebSocketConnection";
import { useSocketIOConnection } from "./useSocketIOConnection";
import { useSSEConnection } from "./useSSEConnection";
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
  const effectRan = useRef(false);
  const browserSessionId = useRef(getBrowserSessionId());
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

  useWebSocketConnection(
    connectionStatus.websocket,
    browserSessionId.current,
    addLog,
    updateChartData,
    onTradingLog,
    handleServerInfo
  );
  useSocketIOConnection(
    connectionStatus.socketio,
    browserSessionId.current,
    addLog,
    updateChartData,
    onTradingLog,
    handleServerInfo
  );
  useSSEConnection(
    connectionStatus.sse,
    browserSessionId.current,
    addLog,
    updateChartData,
    onTradingLog,
    handleServerInfo
  );
  const handleOnline = useCallback(() => {
    addLog("Network connection restored", "success", "global");
  }, [addLog]);
  const handleOffline = useCallback(() => {
    addLog("Network connection lost", "warning", "global");
  }, [addLog]);
  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }
    return () => {
      if (
        effectRan.current === false &&
        process.env.NODE_ENV === "development"
      ) {
      } else {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
      effectRan.current = true;
    };
  }, [handleOnline, handleOffline]);
  return {};
}
