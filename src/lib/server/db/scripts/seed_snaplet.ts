/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";
import { createPassword } from "../../services/password";

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const password = await createPassword("password123");

  // Seed the database with 10 users
  await seed.users((x) => x(10, {
    email: (x) => copycat.email(x.seed, { domain: "email.com" }).toLowerCase(),
    id: (x) => copycat.uuid(x.seed),
    password: password,
    login_attempts: 0,
    lock_until: 0,
  }));

  process.exit();
};

main();