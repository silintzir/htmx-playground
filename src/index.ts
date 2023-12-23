import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import { URL } from 'url';
import { db } from './db/connection.js';
import { z } from 'zod';

import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import { contacts } from './db/schema.js';
import { eq, like } from 'drizzle-orm';
import createHttpError from 'http-errors';

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

app.get('/contacts', async (req, res) => {
  const { q } = req.query;
  const result = q
    ? await db
        .select()
        .from(contacts)
        .where(like(contacts.firstName, `%${q}%`))
    : await db.query.contacts.findMany();

  res.render('index', {
    contacts: result,
    q,
  });
});

app.get('/contacts/new', (_, res) => {
  res.render('new', {
    contact: { firstName: '', lastName: '', phone: '', email: '' },
  });
});

const schema = z.object({
  firstName: z.string({ required_error: 'Field is required' }).min(1),
  lastName: z.string({ required_error: 'Field is required' }).min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

app.post('/contacts/new', async (req, res) => {
  const { body } = req;

  const result = schema.safeParse(body);
  if (!result.success) {
    return res.render('new', {
      contact: body,
      errors: result.error.flatten().fieldErrors,
    });
  }

  await db.insert(contacts).values(body);

  res.redirect('/contacts');
});

app.get('/contacts/:id', async (req, res, next) => {
  const { id } = req.params;

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }

  res.render('view', { contact });
});

app.get('/contacts/:id/edit', async (req, res, next) => {
  const { id } = req.params;

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }

  res.render('edit', { contact });
});

app.post('/contacts/:id/delete', async (req, res, next) => {
  const { id } = req.params;

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }

  await db.delete(contacts).where(eq(contacts.id, +id));
  res.redirect('/contacts');
});

app.post('/contacts/:id/edit', async (req, res, next) => {
  const { body } = req;
  const { id } = req.params;

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return res.render('edit', {
      contact: body,
      errors: result.error.flatten().fieldErrors,
    });
  }

  await db.update(contacts).set(body).where(eq(contacts.id, +id));

  res.redirect('/contacts');
});

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
