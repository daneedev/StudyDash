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
import connectSessionSequelize from 'connect-session-sequelize';
import flash from 'connect-flash';
dotenv.config();

import dashRoutes from './routes/dash.routes';
import authRoutes from './routes/auth.routes';
import classRoutes from './routes/class.routes';
import { connect, db } from './db';

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

const SequelizeStore = connectSessionSequelize(session.Store);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
  store: new SequelizeStore({ db: db }),
}));

app.use(flash());
app.use(express.urlencoded({ extended: false }));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
loadPassport();

// DATABASE
db.sync()
connect();

app.use("/", express.static(path.join(__dirname, 'public')));

app.use("/auth", authRoutes)

app.use("/dash", dashRoutes)

app.use("/class", classRoutes)

app.get("/", function (req, res) {
  res.render("index.html");
})

app.get("/:file", function (req, res) {
  res.render(req.params.file);
})

if (process.env.PORT === undefined) {
  console.error('PORT must be provided');
  process.exit(1);
}

server.listen(process.env.PORT, () => {
  Logger.logInfo(`Server is running on http://localhost:${process.env.PORT}`);
});