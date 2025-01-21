import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
dotenv.config();

const app = express();
const server = createServer(app);


server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});