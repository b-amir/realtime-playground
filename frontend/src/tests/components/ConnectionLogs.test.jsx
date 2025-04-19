import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConnectionLogs from "../../components/ConnectionLogs";

vi.mock("./ui/card", () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h5>{children}</h5>,
  CardContent: ({ children }) => <div>{children}</div>,
}));

vi.mock("./ui/scroll-area", () => ({
  ScrollArea: ({ children }) => <div>{children}</div>,
}));

vi.mock("./ui/checkbox", () => ({
  Checkbox: (props) => <input type="checkbox" {...props} />,
}));

vi.mock("./ui/button", () => ({
  Button: (props) => <button {...props}>{props.children}</button>,
}));

describe("ConnectionLogs", () => {
  it("renders log entries passed as props", () => {
    const mockLogs = [
      {
        id: "log-1",
        timestamp: "10:00:01",
        type: "info",
        message: "Log message 1",
      },
      {
        id: "log-2",
        timestamp: "10:00:02",
        type: "success",
        message: "Log message 2",
      },
      {
        id: "tx-123",
        timestamp: "10:00:03",
        type: "trade",
        message: "Trade message",
      },
    ];
    render(
      <ConnectionLogs
        title="Ignored Title"
        logs={mockLogs}
        clearLogs={() => {}}
      />
    );
    expect(screen.getByText("Connection Logs")).toBeInTheDocument();
    expect(screen.getByText(/Log message 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Log message 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Trade message/i)).toBeInTheDocument();
  });
});
