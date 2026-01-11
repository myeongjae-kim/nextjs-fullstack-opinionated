import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/mysql-core';

export const article = mysqlTable('article', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
