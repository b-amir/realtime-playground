import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import App from "../App";

describe("App", () => {
  beforeEach(() => {
    render(<App />);
  });

  it("renders the main application component with title", () => {
    expect(screen.getByText(/Real-time Playground/i)).toBeInTheDocument();
  });

  it("renders the Data History section", () => {
    expect(screen.getByText(/Data History/i)).toBeInTheDocument();
  });

  it("renders the Trading Room section", () => {
    expect(screen.getByText(/Trading Room/i)).toBeInTheDocument();
  });

  it("renders the Connection Logs section", () => {
    expect(screen.getByText(/Connection Logs/i)).toBeInTheDocument();
  });
});
