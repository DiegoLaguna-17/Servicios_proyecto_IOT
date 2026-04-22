// utils/socket.js
let io;

module.exports = {
    init: (httpServer) => {
        const { Server } = require("socket.io");
        io = new Server(httpServer, {
            cors: {
                origin: "*", // Permite conexiones desde cualquier frontend (Vue)
                methods: ["GET", "POST"]
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io no está inicializado!");
        }
        return io;
    }
};