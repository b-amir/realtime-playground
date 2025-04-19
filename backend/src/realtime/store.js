let userIdCounter = 0;
let isAdminBrowserSessionAssigned = false;

const serverStartTime = new Date();

const browserSessions = new Map();

const connectedClients = {
  websocket: new Map(),
  socketio: new Map(),
  sse: new Map(),
};

const sseClients = new Set();

function getNextUserId() {
  return `user_${++userIdCounter}`;
}

function getOrCreateBrowserSession(browserSessionId, ip) {
  if (browserSessions.has(browserSessionId)) {
    const session = browserSessions.get(browserSessionId);
    session.lastIp = ip;
    return session;
  }

  const userId = getNextUserId();
  let role = "user";
  if (!isAdminBrowserSessionAssigned) {
    role = "admin";
    isAdminBrowserSessionAssigned = true;
    console.log(
      `Assigning admin role to first browser session: ${browserSessionId} (User ID: ${userId})`
    );
  }

  const newSession = {
    userId: userId,
    role: role,
    firstSeen: new Date(),
    lastIp: ip,
  };
  browserSessions.set(browserSessionId, newSession);
  return newSession;
}

module.exports = {
  getNextUserId,
  serverStartTime,
  connectedClients,
  sseClients,
  browserSessions,
  getOrCreateBrowserSession,
};
