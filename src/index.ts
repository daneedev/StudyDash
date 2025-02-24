import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import nunjucks from 'nunjucks';
import path from 'path';
dotenv.config();

const app = express();
const server = createServer(app);

nunjucks.configure('src/views', {
  autoescape: true,
  express: app,
  watch: true
});

app.use("/", express.static(path.join(__dirname, 'public')));

app.get("/:file", function (req, res) {
  res.render(req.params.file);
})

if (process.env.PORT === undefined) {
  console.error('PORT must be provided');
  process.exit(1);
}

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});