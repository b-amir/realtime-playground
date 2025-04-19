import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CONNECTION_METHODS } from "/src/constants/connectionMethods.jsx";
import MethodCard from "./MethodCard";
import {
  ArrowDownUp,
  Check,
  CloudOff,
  Plus,
  Slash,
  Unplug,
  X,
} from "lucide-react";
function MethodCards({
  chartData,
  connectionStatus,
  onToggle,
  onTrade,
  transactionCounts = {},
}) {
  const [warningStates, setWarningStates] = useState({});
  const warningTimers = useRef({});
  useEffect(() => {
    const timers = warningTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);
  const showWarning = (methodValue, message) => {
    if (warningTimers.current[methodValue]) {
      clearTimeout(warningTimers.current[methodValue]);
    }
    setWarningStates((prev) => ({
      ...prev,
      [methodValue]: { show: true, message },
    }));
    warningTimers.current[methodValue] = setTimeout(() => {
      hideWarning(methodValue);
    }, 3000);
  };
  const hideWarning = (methodValue) => {
    if (warningTimers.current[methodValue]) {
      clearTimeout(warningTimers.current[methodValue]);
      delete warningTimers.current[methodValue];
    }
    setWarningStates((prev) => ({
      ...prev,
      [methodValue]: { show: false, message: "" },
    }));
  };
  const getCurrentPrice = (methodValue) => {
    if (!chartData.length) return null;
    return chartData[chartData.length - 1][methodValue];
  };
  return (
    <div className="method-cards-container rounded-lg bg-card text-card-foreground">
      <div className="method-cards-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONNECTION_METHODS.map((method) => {
          const price = getCurrentPrice(method.value);
          const isWatching = connectionStatus[method.value];
          const currentWarning = warningStates[method.value];
          const transactionCount = transactionCounts[method.value] || 0;
          return (
            <MethodCard
              key={method.value}
              method={method}
              price={price}
              isWatching={isWatching}
              currentWarning={currentWarning}
              transactionCount={transactionCount}
              onToggle={onToggle}
              onTrade={onTrade}
              showWarning={showWarning}
              hideWarning={hideWarning}
            />
          );
        })}
      </div>
    </div>
  );
}
export default React.memo(MethodCards);
