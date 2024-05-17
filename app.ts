import express, { Express } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server as SocketIO } from "socket.io";
import router from "./routes"; // Assuming routes are properly defined in this import.

class App {
  private server: Express;
  private httpServer: http.Server;
  private io: SocketIO;

  constructor() {
    this.server = express();
    this.server.use(express.json());

    this.server.use(
      cors({
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
        credentials: true,
      })
    );

    this.server.use("/api", router);

    this.httpServer = new http.Server(this.server);

    this.io = new SocketIO(this.httpServer, {
      cors: {
        origin: "http://localhost:5173", // Ensure this matches the client's origin, without trailing slash
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setUpSocket();
  }

  public run() {
    this.httpServer.listen(8000, () => {
      console.log("Server is listening on port 8000");
    });
  }

  private setUpSocket() {
    this.io.on("connection", (socket) => {
      console.log("New client connected");
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
}

export default App;
