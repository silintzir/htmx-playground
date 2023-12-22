import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { URL } from 'url';
import { db } from './db/connection.js';

const __dirname = new URL('.', import.meta.url).pathname;

const app = express();

app.use(express.json());
app.use(
  morgan('dev', {
    skip(req) {
      return req.url === '/favicon.ico' || req.url.startsWith('/styles');
    },
  }),
);

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_, res) => {
  res.render('index');
});

app.get('/contacts', async (req, res) => {
  const { q } = req.query;
  console.log(q);
  const contacts = q ? await db.query.contacts.findMany() : [];

  res.render('contacts', { contacts });
});

app.listen(3000, () => {
  console.log('Listening on 3000');
});
