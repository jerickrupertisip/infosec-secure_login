import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from "drizzle-orm"
import * as schema from '../schema';
import * as dotenv from 'dotenv';

dotenv.config()

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });

async function main() {
  const user: typeof schema.users.$inferInsert = {
    email: 'john@example.com',
    password: 'password1',
  };

  await db.delete(schema.users)

  await db.insert(schema.users).values(user);
  console.log('New user created!')

  const users = await db.select().from(schema.users);
  console.log('Getting all users from the database: ', users)

  await db
    .update(schema.users)
    .set({
      password: "newpassword1",
    })
    .where(eq(schema.users.email, user.email));
  console.log('User info updated!')

  await db.delete(schema.users).where(eq(schema.users.email, user.email));
  console.log('User deleted!')
}

main();

