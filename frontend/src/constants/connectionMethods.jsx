import { Wifi, Radio, Activity } from "lucide-react";
export const CONNECTION_METHODS = [
  {
    value: "websocket",
    label: "$NWS",
    fullName: "Native Websocket",
    color: "var(--color-websocket)",
    icon: <Wifi className="h-5 w-5" />,
    canTrade: true,
    defaultInWatchlist: true,
  },
  {
    value: "socketio",
    label: "$SIO",
    fullName: "Socket.IO",
    color: "var(--color-socketio)",
    icon: <Radio className="h-5 w-5" />,
    canTrade: true,
    defaultInWatchlist: false,
  },
  {
    value: "sse",
    label: "$SSE",
    fullName: "Server-sent Events",
    color: "var(--color-sse)",
    icon: <Activity className="h-5 w-5" />,
    canTrade: false,
    defaultInWatchlist: false,
  },
];
