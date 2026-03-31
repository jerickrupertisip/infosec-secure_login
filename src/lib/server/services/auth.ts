import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { scrypt as _scrypt } from 'crypto'
import { comparePassword, createPassword } from './password'

export async function createUser(email: string, pass: string) {
  // 1. Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email))
  if (existing.length > 0) {
    throw new Error('AUTH_USER_EXISTS')
  }

  // 2. Hash password (Salt is handled automatically by bcrypt)
  const hashedPassword = await createPassword(pass)

  // 3. Insert into DB
  const newUser = await db.insert(users).values({
    email,
    password: hashedPassword,
  }).returning()

  const { password, ...userWithoutPassword } = newUser[0]
  return userWithoutPassword
}

export async function verifyUser(email: string, pass: string) {
  // 1. Find the user by email
  const user = await db.select().from(users).where(eq(users.email, email))

  // 2. If user doesn't exist, return null
  if (user.length == 0) {
    throw new Error("AUTH_USER_NOT_FOUND")
  }

  // 3. Compare the provided password with the stored hash
  const isValid = await comparePassword(pass, user[0].password)

  if (!isValid) {
    throw new Error('AUTH_INVALID_PASSWORD')
  }

  // 4. Return the user (excluding the password for security)
  const { password, ...userWithoutPassword } = user[0]
  return userWithoutPassword
}
