import { useState, useRef, useCallback } from "react";
import { CONNECTION_METHODS } from "/src/constants/connectionMethods";
const MAX_CHART_POINTS = 30;
export function useChartData(addLog, incrementTransactionCount) {
  const [chartData, setChartData] = useState([]);
  const updateTimeoutRef = useRef(null);
  const pendingUpdates = useRef({});
  const updateChartData = useCallback(
    (data) => {
      try {
        incrementTransactionCount(data.stock);
        pendingUpdates.current[data.stock] = data.price;
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        updateTimeoutRef.current = setTimeout(() => {
          setChartData((prevData) => {
            const newData = [...prevData];
            const timestamp = new Date().getTime();
            let entry = { timestamp };
            CONNECTION_METHODS.forEach((m) => {
              const lastEntry = prevData[prevData.length - 1];
              if (pendingUpdates.current[m.value] !== undefined) {
                entry[m.value] = pendingUpdates.current[m.value];
              } else if (lastEntry) {
                entry[m.value] = lastEntry[m.value];
              }
            });
            newData.push(entry);
            pendingUpdates.current = {};
            return newData.slice(-MAX_CHART_POINTS);
          });
          updateTimeoutRef.current = null;
        }, 50);
      } catch (error) {
        addLog(`Error updating chart: ${error.message}`, "error", "global");
      }
    },
    [addLog, incrementTransactionCount]
  );
  const getCurrentPrice = useCallback(
    (method) => {
      if (!chartData.length) return null;
      const latestData = chartData[chartData.length - 1];
      return latestData[method];
    },
    [chartData]
  );
  return {
    chartData,
    updateChartData,
    getCurrentPrice,
  };
}
