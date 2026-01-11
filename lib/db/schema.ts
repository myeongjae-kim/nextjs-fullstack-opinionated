import {
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from 'drizzle-orm/mysql-core';

export const article = mysqlTable('article', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const user = mysqlTable('user', {
  id: int('id').primaryKey().autoincrement(),
  ulid: varchar('ulid', { length: 26 }).notNull(),
  name: varchar('name', { length: 100 }),
  loginId: varchar('login_id', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => [
  uniqueIndex('ux_user_ulid').on(table.ulid),
  uniqueIndex('ux_user_login_id').on(table.loginId),
]);