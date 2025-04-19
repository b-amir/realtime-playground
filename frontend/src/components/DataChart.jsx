import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { CONNECTION_METHODS } from "/src/constants/connectionMethods";
function ChartHeader() {
  return (
    <div className="chart-header mb-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Data History</h2>
      </div>
    </div>
  );
}
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/85 backdrop-blur-sm border border-white/15 rounded-xl shadow-lg p-3 text-white">
      <p className="text-white/80 mb-1.5 font-semibold text-sm">
        {new Date(label).toLocaleTimeString()}
      </p>
      {payload.map((entry, index) => {
        const methodInfo = CONNECTION_METHODS.find(
          (m) => m.value === entry.dataKey
        );
        const methodLabel = methodInfo?.label || entry.dataKey;
        return (
          <div
            key={entry.dataKey}
            className="py-1 font-medium"
            style={{ color: entry.color }}
          >
            {methodLabel}: ${entry.value.toFixed(2)}
          </div>
        );
      })}
    </div>
  );
};
function DataChart({ chartData, connectionStatus }) {
  const yAxisDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [0, 100];
    }
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    chartData.forEach((dataPoint) => {
      CONNECTION_METHODS.forEach((method) => {
        if (
          connectionStatus[method.value] &&
          dataPoint[method.value] !== undefined
        ) {
          minPrice = Math.min(minPrice, dataPoint[method.value]);
          maxPrice = Math.max(maxPrice, dataPoint[method.value]);
        }
      });
    });
    if (minPrice === Infinity || maxPrice === -Infinity) {
      return [0, 100];
    }
    const padding = (maxPrice - minPrice) * 0.1;
    const domainMin = Math.max(0, minPrice - padding);
    const domainMax = maxPrice + padding;
    return [domainMin, domainMax];
  }, [chartData, connectionStatus]);
  const cursorStyle = {
    stroke: "rgba(255, 255, 255, 0.4)",
    strokeWidth: 1.5,
    strokeDasharray: "4 4",
  };
  return (
    <div className="chart-container p-6 h-full flex flex-col">
      <ChartHeader />
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          isAnimationActive={true}
          animationDuration={500}
          animationEasing="ease-out"
        >
          <defs>
            {CONNECTION_METHODS.map((method) => (
              <linearGradient
                key={`gradient-${method.value}`}
                id={`fill${method.label.replace(/[^a-zA-Z0-9]/g, "")}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={method.color} stopOpacity={0.7} />
                <stop offset="10%" stopColor={method.color} stopOpacity={0.5} />
                <stop offset="30%" stopColor={method.color} stopOpacity={0.3} />
                <stop offset="60%" stopColor={method.color} stopOpacity={0.1} />
                <stop
                  offset="100%"
                  stopColor={method.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval="preserveStartEnd"
            minTickGap={50}
            tickCount={5}
            allowDataOverflow={true}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            interval={0}
            domain={yAxisDomain}
            allowDataOverflow={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={cursorStyle} />
          {CONNECTION_METHODS.map((method) =>
            connectionStatus[method.value] ? (
              <Area
                key={method.value}
                type="monotone"
                dataKey={method.value}
                stroke={method.color}
                fillOpacity={1}
                fill={`url(#fill${method.label.replace(/[^a-zA-Z0-9]/g, "")})`}
                strokeWidth={2}
                activeDot={{
                  r: 6,
                  fill: method.color,
                  stroke: "#000",
                  strokeWidth: 1,
                }}
                dot={false}
              />
            ) : null
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export default React.memo(DataChart);
