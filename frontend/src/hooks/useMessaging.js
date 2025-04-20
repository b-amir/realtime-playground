import { useState, useCallback, useRef, useEffect } from "react";
import { CONNECTION_METHODS } from "/src/constants/connectionMethods";
const MAX_TRADING_LOGS = 50;
export function useMessaging(
  clientId,
  addLog,
  getCurrentPrice,
  incrementTransactionCount,
  tradingLogsConnectionStatus
) {
  const [messages, setMessages] = useState([]);
  const [processedMessageIds] = useState(new Set());
  const latestStatusRef = useRef(tradingLogsConnectionStatus);
  useEffect(() => {
    latestStatusRef.current = tradingLogsConnectionStatus;
  }, [tradingLogsConnectionStatus]);
  const handleReceiveMessage = useCallback(
    (message, method) => {
      const currentStatus = latestStatusRef.current;
      const isMethodWatched = currentStatus && currentStatus[method];
      if (!isMethodWatched) {
        return;
      }
      if (!message || !message.id) {
        console.warn("[handleReceiveMessage] Received invalid message object:", message);
        return;
      }
      if (!processedMessageIds.has(message.id)) {
        processedMessageIds.add(message.id);
        if (processedMessageIds.size > MAX_TRADING_LOGS * 3) {
          const idsArray = Array.from(processedMessageIds);
          const idsToRemove = idsArray.slice(0, MAX_TRADING_LOGS);
          idsToRemove.forEach((id) => processedMessageIds.delete(id));
        }
        setMessages((prev) => {
          const isSelf = message.sender === clientId;
          const newMessages = [...prev, { ...message, isSelf }];
          return newMessages.slice(-MAX_TRADING_LOGS);
        });
      }
    },
    [clientId, processedMessageIds]
  );
  const getActiveMethod = useCallback((tradingLogsConnectionStatus) => {
    if (tradingLogsConnectionStatus.socketio) return "socketio";
    if (tradingLogsConnectionStatus.websocket) return "websocket";
    if (tradingLogsConnectionStatus.sse) return "sse";
    return null;
  }, []);
  const handleSendMessage = useCallback(
    (text, currentTradingLogsConnectionStatus) => {
      if (!clientId) {
        addLog(
          "Cannot send message: Not connected to server",
          "error",
          "global"
        );
        return;
      }
      const activeMethod = getActiveMethod(currentTradingLogsConnectionStatus);
      if (!activeMethod) {
        addLog(
          "Cannot send message: No method in watchlist",
          "error",
          "global"
        );
        return;
      }
      const currentPrice = getCurrentPrice(activeMethod);
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        sender: clientId,
        timestamp: new Date().toLocaleTimeString(),
        isSelf: true,
        method: activeMethod,
        tradeAction: null,
        price: currentPrice,
      };
      if (!processedMessageIds.has(newMessage.id)) {
        processedMessageIds.add(newMessage.id);
        setMessages((prev) => {
          const newMessages = [...prev, newMessage];
          return newMessages.slice(-MAX_TRADING_LOGS);
        });
      }
      if (activeMethod === "socketio") {
        window.socket?.emit("trading_log", newMessage);
        incrementTransactionCount("socketio");
      } else if (activeMethod === "websocket") {
        window.ws?.send(
          JSON.stringify({ type: "trading_log", data: newMessage })
        );
        incrementTransactionCount("websocket");
      } else if (activeMethod === "sse") {
        fetch("/api/trading-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }).catch((error) => {
          addLog(`Error sending message: ${error.message}`, "error", "sse");
        });
        incrementTransactionCount("sse");
      }
    },
    [
      clientId,
      addLog,
      getActiveMethod,
      getCurrentPrice,
      incrementTransactionCount,
      processedMessageIds
    ]
  );
  const handleTrade = useCallback(
    (methodValue, tradeType, graphConnectionStatus) => {
      const methodConfig = CONNECTION_METHODS.find(
        (m) => m.value === methodValue
      );
      if (!methodConfig || !graphConnectionStatus[methodValue]) return;
      if (!clientId) {
        addLog("Cannot trade: No client ID", "error", "global");
        return;
      }
      const currentPrice = getCurrentPrice(methodValue);
      const formattedTradeType =
        tradeType.charAt(0).toUpperCase() + tradeType.slice(1);
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender: clientId,
        timestamp: new Date().toLocaleTimeString(),
        isSelf: true,
        method: methodValue,
        tradeAction: formattedTradeType,
        price: currentPrice,
      };
      if (!processedMessageIds.has(newMessage.id)) {
        processedMessageIds.add(newMessage.id);
        setMessages((prev) => {
          const newMessages = [...prev, newMessage];
          return newMessages.slice(-MAX_TRADING_LOGS);
        });
      }
      if (methodValue === "socketio" && window.socket) {
        window.socket.emit("trading_action", newMessage);
        incrementTransactionCount("socketio");
      } else if (methodValue === "websocket" && window.ws) {
        window.ws.send(
          JSON.stringify({ type: "trading_action", data: newMessage })
        );
        incrementTransactionCount("websocket");
      }
    },
    [clientId, addLog, getCurrentPrice, incrementTransactionCount, processedMessageIds]
  );
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  return {
    messages,
    handleReceiveMessage,
    handleSendMessage,
    handleTrade,
    clearMessages,
    getActiveMethod,
  };
}
