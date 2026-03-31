import { int, sqliteTable, text, } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable("users", {
  id: text("id").primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  login_attempt: int("login_attempt").notNull().default(0),
  lock_until: int("lock_until").notNull().default(0),
});
