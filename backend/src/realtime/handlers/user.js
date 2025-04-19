function setupUserHandlers(namespace) {
  namespace.on("connection", (socket) => {
    console.log("User connected");
    socket.join("user-room");

    socket.on("user:message", (data, callback) => {
      console.log("User message:", data);
      callback({ status: "received" });
    });
  });
}

module.exports = {
  setupUserHandlers,
};
