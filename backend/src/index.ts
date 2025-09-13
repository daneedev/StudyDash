import express from "express";
import { createServer } from "http";
import { config } from "dotenv";
import { resolve } from "path";
import Logger from "./utils/logger";

// Load environment variables from parent directory
config({ path: resolve(__dirname, "../../.env") });

const app = express();
const server = createServer(app);

server.listen(process.env.PORT || 3001, () => {
  Logger.logInfo(`Backend is running on http://localhost:${process.env.PORT || 3001}`);
});
