import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import nunjucks from 'nunjucks';
import path from 'path';
import Logger from './utils/logger';
dotenv.config();

const app = express();
const server = createServer(app);

nunjucks.configure('src/views', {
  autoescape: true,
  express: app,
  watch: true
});

// DATABASE
import { connect } from './db';
connect();

app.use("/", express.static(path.join(__dirname, 'public')));

app.get("/:file", function (req, res) {
  res.render(req.params.file);
})

server.listen(process.env.PORT, () => {
  Logger.logInfo(`Server is running on http://localhost:${process.env.PORT}`);
});