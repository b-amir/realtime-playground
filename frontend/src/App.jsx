import { useState, useCallback } from "react";
import { useChartData } from "./hooks/useChartData";
import { useLogging } from "./hooks/useLogging";
import { useMessaging } from "./hooks/useMessaging";
import { useConnectionStatus } from "./hooks/useConnectionStatus";
import AppHeader from "./components/AppHeader";
import DataChart from "./components/DataChart";
import ConnectionLogs from "./components/ConnectionLogs";
import TradingLogs from "./components/TradingLogs";
import MethodCards from "./components/MethodCards";
import "./App.css";
import { useConnectionManager } from "./hooks/useConnectionManager";
const emptyPrice = {};
function App() {
  const [clientId, setClientId] = useState(null);
  const { logs, addLog, clearLogs } = useLogging();
  const {
    graphConnectionStatus,
    tradingLogsConnectionStatus,
    transactionCounts,
    handleGraphToggle,
    handleTradingLogsToggle,
    incrementTransactionCount,
    combinedConnectionStatus,
    isGraphDisabled,
  } = useConnectionStatus();
  const { chartData, updateChartData, getCurrentPrice } = useChartData(
    addLog,
    incrementTransactionCount
  );
  const {
    messages,
    handleReceiveMessage,
    handleSendMessage,
    handleTrade,
    clearMessages,
  } = useMessaging(
    clientId,
    addLog,
    getCurrentPrice,
    incrementTransactionCount,
    tradingLogsConnectionStatus
  );
  const handleClientIdSet = useCallback((newClientId) => {
    setClientId(newClientId);
  }, []);
  const onSendMessage = useCallback(
    (text) => {
      handleSendMessage(text, tradingLogsConnectionStatus);
    },
    [handleSendMessage, tradingLogsConnectionStatus]
  );
  const onTrade = useCallback(
    (methodValue, tradeType) => {
      handleTrade(methodValue, tradeType, graphConnectionStatus);
    },
    [handleTrade, graphConnectionStatus]
  );
  useConnectionManager(
    combinedConnectionStatus,
    addLog,
    updateChartData,
    handleReceiveMessage,
    handleClientIdSet
  );
  const currentPrices =
    chartData.length > 0 ? chartData[chartData.length - 1] : emptyPrice;
  return (
    <div className="App flex flex-col h-screen p-6 bg-background text-foreground overflow-hidden">
      <AppHeader username={clientId} />
      <div className="grid grid-cols-3 gap-6 flex-grow h-[calc(100vh-150px)] mt-6">
        <div className="col-span-2 flex flex-col gap-6 h-full">
          <div className="flex-shrink-0">
            <MethodCards
              chartData={chartData}
              connectionStatus={graphConnectionStatus}
              onToggle={handleGraphToggle}
              onTrade={onTrade}
              transactionCounts={transactionCounts}
            />
          </div>
          <div className="flex-grow rounded-lg shadow-lg border border-border overflow-hidden bg-slate-900 bg-opacity-20 min-h-0">
            <DataChart
              className="h-full w-full"
              chartData={chartData}
              connectionStatus={graphConnectionStatus}
              isEmpty={chartData.length === 0}
              isDisabled={isGraphDisabled}
              onToggle={handleGraphToggle}
              onTrade={onTrade}
            />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 h-full">
          <div className="h-1/2 min-h-0 rounded-lg shadow-lg bg-slate-900 bg-opacity-20 border border-border overflow-hidden flex flex-col">
            <TradingLogs
              className="h-full w-full"
              messages={messages}
              onSendMessage={onSendMessage}
              connectionStatus={tradingLogsConnectionStatus}
              onToggle={handleTradingLogsToggle}
              currentPrices={currentPrices}
              onClearMessages={clearMessages}
            />
          </div>
          <div className="h-1/2 min-h-0 rounded-lg shadow-lg bg-slate-900 bg-opacity-20 border border-border overflow-hidden flex flex-col">
            <ConnectionLogs
              className="h-full w-full"
              logs={logs}
              onClearLogs={clearLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
