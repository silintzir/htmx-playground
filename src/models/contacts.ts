import { eq, not, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/db/connection.js';
import { contacts } from '~/db/schema.js';

export const schema = z
  .object({
    id: z.number().optional(),
    firstName: z
      .string({ required_error: 'Field is required' })
      .min(1, { message: 'Field is required' }),
    lastName: z
      .string({ required_error: 'Field is required' })
      .min(1, { message: 'Field is required' }),
    phone: z.string().optional(),
    email: z
      .string({ required_error: 'Field is required' })
      .min(1, { message: 'Field is required' })
      .email(),
  })
  .refine(
    async (data) => {
      // check if email already exists
      const exists = await db.query.contacts.findFirst({
        where: and(
          eq(contacts.email, data.email),
          not(eq(contacts.id, data.id || 0)),
        ),
      });
      return !exists;
    },
    {
      path: ['email'],
      message: 'Email already taken',
    },
  );

export type Contact = z.infer<typeof schema>;
