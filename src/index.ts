import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import { URL } from 'url';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import createHttpError from 'http-errors';
import { contacts } from '~/routes/contacts.js';

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

const __dirname = new URL('.', import.meta.url).pathname;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use(
  connectLiveReload({
    port: 35729,
  }),
);

app.get('/', (_, res) => {
  res.redirect('/contacts');
});

app.use('/contacts', contacts);

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof createHttpError.HttpError) {
    if (err.statusCode === 404) {
      return res.status(404).render('errors/404');
    }
  }

  res.status(500).render('errors/500');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
