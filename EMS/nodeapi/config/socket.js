const { Server } = require("socket.io");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        // Join user to a private room (based on userId)
        socket.on("register", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });

        // Disconnect event
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
}

function sendNotification(userId, message) {
    if (!io) return;
    io.to(userId).emit("notification", message);
}

module.exports = { initSocket, sendNotification };
