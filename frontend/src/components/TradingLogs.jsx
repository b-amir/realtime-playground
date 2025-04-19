import React, { useRef, useEffect, useState } from "react";
import { CircleSlash2, MessageSquare, Trash2 } from "lucide-react";
import { CONNECTION_METHODS } from "@/constants/connectionMethods";
function LogHeader({ autoScroll, setAutoScroll, onClearMessages }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Trading Room</h2>
        </div>
      </div>
      <div className="flex items-center justify-start gap-4 px-4 py-2 bg-slate-900/70 backdrop-blur-md border-y border-border sticky top-0 z-10 -mb-8">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="w-4 h-4"
          />
          Auto-scroll
        </label>
        <button
          onClick={onClearMessages}
          className="flex items-center gap-2 text-xs hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear Logs
        </button>
      </div>
    </>
  );
}
function MessageItem({ msg }) {
  const messageStyle =
    msg.tradeAction === "Buy"
      ? {
          background: "rgba(56, 180, 139, 0.03)",
          border: "1px solid #0d353178",
        }
      : msg.tradeAction === "Sell"
        ? {
            background: "rgba(255, 77, 109, 0.03)",
            border: "1px solid #28112c8a",
          }
        : { background: "transparent" };
  const methodColor = CONNECTION_METHODS.find(
    (m) => m.value === msg.method
  )?.color;
  const methodLabel = CONNECTION_METHODS.find(
    (m) => m.value === msg.method
  )?.label;
  return (
    <div
      className={`flex p-3 px-4 flex-row items-start w-full rounded-xl relative ${
        msg.tradeAction ? "animate-[pulseFade_2s_ease-in-out]" : ""
      }`}
      style={{
        position: "relative",
        ...messageStyle,
      }}
    >
      <div className="flex flex-col w-full gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-sm">{msg.sender}</div>
          </div>
          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
        </div>
        <div>
          {msg.tradeAction ? (
            <div className="font-medium flex items-center gap-1">
              <span>
                {msg.tradeAction.toLowerCase() === "buy" ? "Bought" : "Sold"}
              </span>
              <span className="text-foreground">
                {msg.method && (
                  <span style={{ color: methodColor }}>{methodLabel}</span>
                )}
                {msg.price ? ` at $${msg.price.toFixed(2)}` : ""}
              </span>
            </div>
          ) : (
            <div className="text-sm text-foreground">{msg.text}</div>
          )}
        </div>
      </div>
    </div>
  );
}
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full flex-grow min-h-0">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <span className="font-bold text-muted-foreground flex flex-col items-center gap-2">
          <CircleSlash2 className="w-4 h-4" />
          No trading logs yet
        </span>
        <span className="text-xs text-muted-foreground">
          Monitor your favorite stocks and place trades
        </span>
      </div>
    </div>
  );
}
function TradingLogs({ messages, onClearMessages }) {
  const messagesEndRef = useRef(null);
  const logsMessagesRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  useEffect(() => {
    if (autoScroll && logsMessagesRef.current) {
      logsMessagesRef.current.scrollTop = logsMessagesRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);
  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <LogHeader
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        onClearMessages={onClearMessages}
      />
      {messages.length > 0 ? (
        <div
          ref={logsMessagesRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-700 scrollbar-thumb-rounded pt-12"
        >
          {messages.map((msg) => (
            <MessageItem key={msg.id} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
export default React.memo(TradingLogs);
