import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CONNECTION_METHODS } from "/src/constants/connectionMethods.jsx";
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
  onTradingLogsToggle,
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
      {}
      <div className="method-cards-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONNECTION_METHODS.map((method) => {
          const price = getCurrentPrice(method.value);
          const isWatching = connectionStatus[method.value];
          const currentWarning = warningStates[method.value];
          const transactionCount = transactionCounts[method.value] || 0;
          const handleCardClick = (e) => {
            const isButtonClick = e.target.closest("button");
            const buttonsEnabled = isWatching && method.canTrade;
            if (isButtonClick && buttonsEnabled) {
              return;
            }
            if (!isWatching) {
              showWarning(method.value, "Add to watchlist first.");
            } else if (!method.canTrade) {
              const actionArea = e.target.closest(".method-card-actions");
              if (actionArea) {
                showWarning(method.value, "This method is not tradable.");
              }
            }
          };
          return (
            <div
              key={method.value}
              className="method-card flex flex-col justify-between rounded-md border bg-slate-900 bg-opacity-20"
            >
              {}
              <div className="method-card-header">
                <div className="flex flex-col text-left p-4">
                  <span
                    className="font-mono font-semibold text-2xl"
                    style={{ color: method.color }}
                  >
                    {method.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {method.fullName}
                  </span>
                </div>
                {isWatching ? (
                  <div
                    className="text-xs text-muted-foreground flex items-center justify-between gap-1 px-4 py-2 bg-slate-900 border-y border-border cursor-pointer transition-all duration-300 ease-in-out group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(method.value);
                      onTradingLogsToggle(method.value);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Check className="text-green-500 h-3 w-3 transition-opacity duration-300 ease-in-out group-hover:opacity-0 absolute" />
                      <X className="text-red-500 h-3 w-3 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100" />
                      <span className="transition-all duration-300 ease-in-out group-hover:text-red-400">
                        <span className="group-hover:hidden">
                          Currently watching
                        </span>
                        <span className="hidden group-hover:inline">
                          Remove from watchlist
                        </span>
                      </span>
                    </div>
                    {transactionCount > 0 && (
                      <div className="flex items-center gap-1 badge text-xs bg-slate-800 px-1.5 rounded-full text-muted-foreground group-hover:bg-red-900">
                        {transactionCount} <ArrowDownUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="text-xs text-foreground flex items-center gap-1 px-4 py-2 bg-slate-900 border-y border-border cursor-pointer hover:text-green-400 transition-all duration-300 ease-in-out"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(method.value);
                      onTradingLogsToggle(method.value);
                    }}
                  >
                    <Plus className="h-3 w-3 transition-transform duration-300 ease-in-out hover:scale-110" />
                    <span className="transition-all duration-300 ease-in-out">
                      Add to watchlist
                    </span>
                  </div>
                )}
              </div>
              {}
              {}
              <div className="relative" onClick={handleCardClick}>
                <div className="method-card-actions flex items-center justify-between px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="buy-button px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrade?.(method.value, "buy");
                    }}
                    disabled={!isWatching || !method.canTrade}
                  >
                    Buy
                  </Button>
                  <div className="price-display text-center text-base font-semibold tabular-nums">
                    {isWatching && price ? (
                      `$${price.toFixed(2)}`
                    ) : (
                      <span className="text-muted-foreground opacity-20">
                        <CloudOff />
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sell-button px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrade?.(method.value, "sell");
                    }}
                    disabled={!isWatching || !method.canTrade}
                  >
                    Sell
                  </Button>
                </div>
                {}
                {currentWarning?.show && (
                  <div className="absolute inset-0 bg-slate-800 bg-opacity-60 text-shadow-md backdrop-blur-sm text-white flex flex-col items-center justify-center p-2 z-10 rounded-b-md text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        hideWarning(method.value);
                      }}
                      className="absolute top-1 right-1 text-white  hover:text-gray-300 p-1"
                      aria-label="Close warning"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-xs px-4">{currentWarning.message}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default React.memo(MethodCards);
