import { useState, useCallback, useMemo, useEffect } from "react";
import { CONNECTION_METHODS } from "/src/constants/connectionMethods";
const GRAPH_WATCHLIST_STORAGE_KEY = "graphWatchlistStatus";
export function useConnectionStatus() {
  const [graphConnectionStatus, setGraphConnectionStatus] = useState(() => {
    try {
      const storedStatus = localStorage.getItem(GRAPH_WATCHLIST_STORAGE_KEY);
      if (storedStatus) {
        const parsedStatus = JSON.parse(storedStatus);
        if (typeof parsedStatus === "object" && parsedStatus !== null) {
          const initialStatus = {};
          CONNECTION_METHODS.forEach((method) => {
            initialStatus[method.value] =
              parsedStatus[method.value] ?? method.defaultInWatchlist;
          });
          return initialStatus;
        }
      }
    } catch (error) {
      console.error(
        "Error reading graph watchlist status from localStorage:",
        error
      );
    }
    const initialStatus = {};
    CONNECTION_METHODS.forEach((method) => {
      initialStatus[method.value] = method.defaultInWatchlist;
    });
    return initialStatus;
  });
  const [tradingLogsConnectionStatus, setTradingLogsConnectionStatus] =
    useState(() => {
      try {
        const storedStatus = localStorage.getItem(GRAPH_WATCHLIST_STORAGE_KEY);
        if (storedStatus) {
          const parsedStatus = JSON.parse(storedStatus);
          if (typeof parsedStatus === "object" && parsedStatus !== null) {
            const initialStatus = {};
            CONNECTION_METHODS.forEach((method) => {
              initialStatus[method.value] =
                parsedStatus[method.value] ?? method.defaultInWatchlist;
            });
            return initialStatus;
          }
        }
      } catch (error) {
        console.error(
          "Error reading graph watchlist status for trading logs from localStorage:",
          error
        );
      }
      const initialStatus = {};
      CONNECTION_METHODS.forEach((method) => {
        initialStatus[method.value] = method.defaultInWatchlist;
      });
      return initialStatus;
    });
  const [transactionCounts, setTransactionCounts] = useState({
    websocket: 0,
    socketio: 0,
    sse: 0,
  });
  const handleGraphToggle = useCallback(
    (toggledMethod) => {
      setGraphConnectionStatus((prevStatus) => ({
        ...prevStatus,
        [toggledMethod]: !prevStatus[toggledMethod],
      }));
      if (!graphConnectionStatus[toggledMethod]) {
        setTradingLogsConnectionStatus((prevStatus) => ({
          ...prevStatus,
          [toggledMethod]: false,
        }));
      }
    },
    [graphConnectionStatus]
  );
  const handleTradingLogsToggle = useCallback((toggledMethod) => {
    setTradingLogsConnectionStatus((prevStatus) => {
      const newStatus = {
        ...prevStatus,
        [toggledMethod]: !prevStatus[toggledMethod],
      };
      if (newStatus[toggledMethod]) {
        setGraphConnectionStatus((prevGraphStatus) => ({
          ...prevGraphStatus,
          [toggledMethod]: true,
        }));
      }
      return newStatus;
    });
  }, [setGraphConnectionStatus]);
  const incrementTransactionCount = useCallback((method) => {
    setTransactionCounts((prev) => ({
      ...prev,
      [method]: prev[method] + 1,
    }));
  }, []);
  const combinedConnectionStatus = useMemo(() => {
    return {
      websocket: graphConnectionStatus.websocket,
      socketio: graphConnectionStatus.socketio,
      sse: graphConnectionStatus.sse,
    };
  }, [graphConnectionStatus]);
  const isGraphDisabled = useMemo(() => {
    return Object.values(graphConnectionStatus).every((status) => !status);
  }, [graphConnectionStatus]);
  const isTradingLogsDisabled = useMemo(() => {
    return Object.values(tradingLogsConnectionStatus).every(
      (status) => !status
    );
  }, [tradingLogsConnectionStatus]);
  useEffect(() => {
    try {
      localStorage.setItem(
        GRAPH_WATCHLIST_STORAGE_KEY,
        JSON.stringify(graphConnectionStatus)
      );
    } catch (error) {
      console.error(
        "Error saving graph watchlist status to localStorage:",
        error
      );
    }
  }, [graphConnectionStatus]);
  return {
    graphConnectionStatus,
    tradingLogsConnectionStatus,
    transactionCounts,
    handleGraphToggle,
    handleTradingLogsToggle,
    incrementTransactionCount,
    combinedConnectionStatus,
    isGraphDisabled,
    isTradingLogsDisabled,
  };
}
