import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import { Liquid } from 'liquidjs';
import { URL } from 'url';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import createHttpError from 'http-errors';
import { contacts } from '~/routes/contacts.js';
import { articles } from '~/routes/articles.js';

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

// rendering engine
const engine = new Liquid({
  cache: process.env.NODE_ENV === 'production',
  layouts: path.resolve(__dirname, 'views/layouts'),
  partials: path.resolve(__dirname, 'views/partials'),
});
app.engine('liquid', engine.express());
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'liquid');

// static rendering
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  connectLiveReload({
    port: 35729,
  }),
);

app.get('/', (_, res) => {
  res.redirect('/articles');
});

app.use('/contacts', contacts);
app.use('/articles', articles);

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof createHttpError.HttpError) {
    if (err.statusCode === 404) {
      return res.status(404).render('errors/404');
    }
  }

  console.log(err);
  res.status(500).render('errors/500');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
