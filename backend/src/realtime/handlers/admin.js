function setupAdminHandlers(namespace) {
  namespace.on("connection", (socket) => {
    console.log("Admin connected");
    socket.join("admin-room");

    socket.on("admin:message", (data, callback) => {
      console.log("Admin message:", data);
      callback({ status: "received" });
    });
  });
}

module.exports = {
  setupAdminHandlers,
};
