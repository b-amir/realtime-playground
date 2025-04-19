import React from "react";
import { ArrowDownUp } from "lucide-react";
function AppHeader({ username }) {
  return (
    <header className="mb-1">
      <div className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <div className="flex flex-row text-3xl font-bold mb-2 ml-2 items-center justify-start gap-4">
            <ArrowDownUp />
            <h1>Real-time Playground</h1>
          </div>
          <p className="text-slate-500 text-md ml-0">
            Monitor live data using different real-time technologies
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center"></div>
        <div className="flex-1 flex justify-end">
          {username && (
            <div className="text-md font-medium text-muted-foreground border rounded-full py-2 px-4">
              Hi, <span className="text-white">{username}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default React.memo(AppHeader);
