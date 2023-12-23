import express from 'express';
import { eq, like } from 'drizzle-orm';
import createHttpError from 'http-errors';
import { mdf } from 'domain-functions';
import { db } from '~/db/connection.js';
import { contacts } from '~/db/schema.js';
import { Contact, schema } from '~/models/contacts.js';
import { parseDomainErrors } from '~/utils/validation.js';

const router = express.Router();

router.get('/new', (_, res) => {
  return res.render('contacts/new', {
    contact: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    },
  });
});

router.get('/:id/edit', async (req, res, next) => {
  const { id } = req.params;
  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }
  return res.render('contacts/edit', { contact });
});

router.get('/', async (req, res) => {
  const { q } = req.query;
  const result = q
    ? await db
        .select()
        .from(contacts)
        .where(like(contacts.firstName, `%${q}%`))
    : await db.query.contacts.findMany();

  return res.render('contacts/index', {
    contacts: result,
    q,
  });
});

router.put('/:id', async (req, res, next) => {
  const {
    body,
    params: { id },
  } = req;
  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }

  const process = mdf(schema)(async (values) => {
    await db.update(contacts).set(body).where(eq(contacts.id, +id));
    return values;
  });

  const values = { ...body, id: +id };

  const result = await process(values);

  if (!result.success) {
    return res.render('contacts/edit', {
      contact: values,
      errors: parseDomainErrors(result),
    });
  }
  return res.redirect(303, '/contacts');
});

router.post('/', async (req, res) => {
  const body = req.body as Contact;
  const process = mdf(schema)(async (values) => {
    await db.insert(contacts).values(body);
    return values;
  });

  const result = await process(body);

  if (!result.success) {
    return res.render('contacts/new', {
      contact: body,
      errors: parseDomainErrors(result),
    });
  }

  return res.redirect(303, '/contacts');
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }
  return res.render('contacts/view', { contact });
});

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, +id),
  });
  if (!contact) {
    return next(createHttpError.NotFound());
  }

  await db.delete(contacts).where(eq(contacts.id, +id));
  return res.redirect(303, '/contacts');
});

export { router as contacts };