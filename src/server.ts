import 'dotenv/config';

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

import knex from './knex';
import getComments from './routes/get-comments';
import newComment from './routes/new-comment';

if (!process.env.SESSION_SECRET) {
  console.error('Please prove a SESSION_SECRET in your .env file.');
  process.exit(1);
}

const app = express();

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 120,
  },
  rolling: true,
}));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

knex.migrate.latest()
  .catch((err) => {
    console.error("Could not ensure database was at the highest migration.", err);
    process.exit(1);  
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Ready to build something awesome?',
  });
});

app.get('/comments', getComments);
app.post('/comments', newComment);

const port = process.env.PORT || 3000;
app.listen(port , () =>
  console.log('App running at http://localhost:' + port));
