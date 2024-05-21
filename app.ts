import express, { Express } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
// import { Server as SocketIO } from "socket.io";
import router from "./routes";
import { initializeSocket } from "./utils/socket-utils";
import { decryptionMiddleware } from "./middleware/middleware";
// import crypto, { ECDH } from "crypto";
// import { MessageService } from "./services/message-service";

dotenv.config();

class App {
  private server: Express;
  private httpServer: http.Server;
  // private ecdh: ECDH;
  // private publicKey: Buffer;
  // private messageService: MessageService;
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

    // Enable this later
    // this.server.use(decryptionMiddleware);

    this.server.use("/api", router);

    this.httpServer = new http.Server(this.server);
    
    initializeSocket(this.httpServer);

    // this.io = new SocketIO(this.httpServer, {
    //   cors: {
    //     origin: "http://localhost:5173",
    //     methods: ["GET", "POST"],
    //     credentials: true,
    //   },
    // });
    // this.ecdh = crypto.createECDH("secp256k1");
    // this.ecdh.generateKeys();
    // this.publicKey = this.ecdh.getPublicKey();
    // this.messageService = new MessageService();
    // this.setUpSocket();
  }

  public run() {
    this.httpServer.listen(8000, () => {
      console.log("Server is listening on port 8000");
    });
  }

  // TODO: Remove this, deprecated
  // private setUpSocket() {
  //   this.io.on("connection", (socket) => {
  //     console.log("New client connected");

  //     socket.emit("publicKey", this.publicKey.toString("hex"));

  //     socket.on("clientPublicKey", (clientPublicKeyHex) => {
  //       const clientPublicKey = Buffer.from(clientPublicKeyHex, "hex");
  //       const sharedSecret = this.ecdh.computeSecret(clientPublicKey);
  //       console.log(
  //         "Shared secret computed by server :",
  //         sharedSecret.toString("hex")
  //       );
  //     });

  //     socket.on("sendMessage", (message) => {
  //       console.log("Get message from client : ", message);
  //       this.messageService.addMessage(message);
  //     });

  //     socket.on("disconnect", () => {
  //       console.log("Client disconnected");
  //     });
  //   });
  // }
}

export default App;
