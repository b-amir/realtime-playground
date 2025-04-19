import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DataChart from "../../components/DataChart";

vi.mock("recharts", async (importOriginal) => {
  const OriginalRecharts = await importOriginal();
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: (props) => (
      <div data-testid={`area-${props.dataKey}`}>{JSON.stringify(props)}</div>
    ),
    XAxis: () => <div data-testid="x-axis"></div>,
    YAxis: () => <div data-testid="y-axis"></div>,
    CartesianGrid: () => <div data-testid="grid"></div>,
    Tooltip: () => <div data-testid="tooltip"></div>,
  };
});

describe("DataChart", () => {
  it("renders the chart components with mock data", () => {
    const mockChartData = [
      { timestamp: 1678886400000, websocket: 100, socketio: 110 },
      { timestamp: 1678886460000, websocket: 101, socketio: 111 },
    ];
    const mockConnectionStatus = {
      websocket: true,
      socketio: true,
      sse: false,
    };
    render(
      <DataChart
        chartData={mockChartData}
        connectionStatus={mockConnectionStatus}
      />
    );

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("area-websocket")).toBeInTheDocument();
    expect(screen.getByTestId("area-socketio")).toBeInTheDocument();
    expect(screen.queryByTestId("area-sse")).not.toBeInTheDocument();
  });
});
