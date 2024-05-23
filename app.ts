import express, { Express } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import router from "./routes";
import { initializeSocket } from "./utils/socket-utils";
import { initializeSchnorrParams } from "./globals/schnorr";
dotenv.config();

class App {
  private server: Express;
  private httpServer: http.Server;
  constructor() {
    this.server = express();
    this.server.use(express.json());

    this.server.use(
      cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST", "PATCH", "OPTIONS", "DELETE", "PUT"],
        credentials: false,
      })
    );

    this.server.use("/api", router);

    this.httpServer = new http.Server(this.server);
    initializeSchnorrParams();
    initializeSocket(this.httpServer);
  }

  public run() {
    this.httpServer.listen(8000, () => {
      console.log("Server is listening on port 8000");
    });
  }
}

export default App;
