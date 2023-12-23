import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const contacts = mysqlTable('contacts', {
  id: int('id').primaryKey().autoincrement(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 16 }),
  email: varchar('email', { length: 256 }),
});

export const mode = 'default';
