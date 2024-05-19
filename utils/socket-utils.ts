import { Server } from "socket.io";
import { socketController } from "../controller/socket-controller";
import http from 'http';

export const initializeSocket = (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: false,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");
    socketController(io, socket);
  });

  return io;
};
