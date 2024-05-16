import express, { Express } from "express";
import dotenv from "dotenv";
import router from "./routes";

class App {
  private server: Express;
  constructor() {
    this.server = express();
    this.server.use(express.json());
    this.server.use("/api", router);
  }

  public run() {
    this.server.listen(8000, () => {
      console.log("Server is listening on port");
    });
  }
}

export default App;
