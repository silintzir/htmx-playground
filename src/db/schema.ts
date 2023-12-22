import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const contacts = mysqlTable('contacts', {
  id: int('id').primaryKey(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 16 }),
});

export const mode = 'default';
