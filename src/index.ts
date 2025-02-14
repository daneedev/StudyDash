import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import nunjucks from 'nunjucks';
import path from 'path';
import Logger from './utils/logger';
import loadPassport from './utils/passport';
import session from 'express-session';
import crypto from 'crypto';
import fs from 'fs';
import passport from 'passport';
dotenv.config();
console.log(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS);

const app = express();
const server = createServer(app);

nunjucks.configure('src/views', {
  autoescape: true,
  express: app,
  watch: true
});

if (!process.env.SESSION_SECRET) {
  Logger.logWarning('No SESSION_SECRET found in .env file. Generating one now...');
  const SESSION_SECRET = crypto.randomBytes(32).toString('hex');
  fs.appendFileSync('.env', `\nSESSION_SECRET=${SESSION_SECRET}`);
  process.env.SESSION_SECRET = SESSION_SECRET;
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  },
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
loadPassport();

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