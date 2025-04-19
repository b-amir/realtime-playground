import { useEffect, useRef, useCallback } from "react";
import { CONNECTION_CONFIG } from "@/config/connection";
export function useSSEConnection(
  isEnabled,
  browserSessionId,
  addLog,
  updateChartData,
  onTradingLog,
  handleServerInfo
) {
  const sseRef = useRef(null);
  const effectRan = useRef(false);
  const closeSSE = useCallback(
    (logMessage = "SSE connection closed (toggled off)") => {
      if (sseRef.current) {
        sseRef.current.close();
        addLog(logMessage, "info", "sse");
        sseRef.current = null;
      }
    },
    [addLog]
  );
  const setupSSE = useCallback(() => {
    if (sseRef.current) return;
    addLog("Connecting to SSE server...", "info", "sse");
    let url = CONNECTION_CONFIG.SSE_URL;
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}browserSessionId=${browserSessionId}`;
    addLog(
      `Attempting SSE connection with session ID: ${browserSessionId}...`,
      "info",
      "sse"
    );
    try {
      const sse = new EventSource(url);
      sseRef.current = sse;
      sse.onopen = () => {
        if (sseRef.current === sse) {
          addLog("Connected to SSE server", "success", "sse");
        }
      };
      sse.onerror = (error) => {
        if (sseRef.current === sse) {
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
      const eventListeners = {
        connection: (event) => {
          const data = JSON.parse(event.data);
          addLog(
            `SSE Connection event: ${JSON.stringify(data)}`,
            "info",
            "sse"
          );
        },
        connection_success: (event) => {
          const data = JSON.parse(event.data);
          addLog(
            `Successfully connected to SSE (${data.client?.id || "N/A"})`,
            "success",
            "sse"
          );
          handleServerInfo(
            {
              type: "server_info",
              eventType: "connection_success",
              data: data,
            },
            "sse"
          );
        },
        connection_error: (event) => {
          const data = JSON.parse(event.data);
          addLog(`SSE Connection error event: ${data.message}`, "error", "sse");
        },
        server_info: (event) => {
          const data = JSON.parse(event.data);
          handleServerInfo(data, "sse");
        },
        trading_log: (event) => {
          const data = JSON.parse(event.data);
          if (onTradingLog) {
            onTradingLog(data, "sse");
          }
        },
      };
      Object.entries(eventListeners).forEach(([eventName, handler]) => {
        sse.addEventListener(eventName, (event) => {
          if (sseRef.current === sse) {
            try {
              handler(event);
            } catch (error) {
              addLog(
                `Error parsing SSE ${eventName} event: ${error.message}`,
                "error",
                "sse"
              );
            }
          }
        });
      });
      sse.onmessage = (event) => {
        if (sseRef.current === sse) {
          try {
            const data = JSON.parse(event.data);
            if (data.stock === "sse") {
              updateChartData(data);
            }
          } catch (error) {
            addLog(
              `Error parsing generic SSE message: ${error.message}`,
              "error",
              "sse"
            );
          }
        }
      };
    } catch (error) {
      addLog(
        `Failed to create SSE connection: ${error.message}`,
        "error",
        "sse"
      );
    }
  }, [
    browserSessionId,
    addLog,
    updateChartData,
    onTradingLog,
    handleServerInfo,
  ]);
  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      if (isEnabled) {
        setupSSE();
      } else {
        closeSSE();
      }
    }
    return () => {
      if (
        effectRan.current === false &&
        process.env.NODE_ENV === "development"
      ) {
        closeSSE("SSE closed (Strict Mode cleanup)");
      }
      effectRan.current = true;
    };
  }, [isEnabled, setupSSE, closeSSE]);
  useEffect(() => {
    return () => {
      closeSSE("SSE closed (Component unmounted)");
    };
  }, [closeSSE]);
  return {};
}
