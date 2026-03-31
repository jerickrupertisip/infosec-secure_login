import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { scrypt as _scrypt } from 'crypto'
import { comparePassword, createPassword } from './password'

const LOGIN_ATTEMPT_LIMIT = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

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

export async function authenticateUser(email: string, pass: string) {
  // 1. Find the user by email
  const user = await db.select().from(users).where(eq(users.email, email))

  // 2. If user doesn't exist, return null
  if (user.length == 0) {
    throw new Error("AUTH_USER_NOT_FOUND")
  }

  const userData = user[0]
  const now = Date.now()

  // 3. If the account is locked, block immediately
  if (userData.lock_until > now) {
    throw new Error('AUTH_USER_LOCKED')
  }

  let loginAttempts = userData.login_attempts
  let lockUntil = userData.lock_until

  // 4. Reset expired lock state before checking credentials
  if (lockUntil !== 0 && lockUntil <= now) {
    loginAttempts = 0
    lockUntil = 0
    await db.update(users).set({ login_attempts: 0, lock_until: 0 }).where(eq(users.id, userData.id))
  }

  // 5. Compare the provided password with the stored hash
  const isValid = await comparePassword(pass, userData.password)

  if (!isValid) {
    loginAttempts += 1

    if (loginAttempts >= LOGIN_ATTEMPT_LIMIT) {
      lockUntil = now + LOCK_TIME
    }

    await db.update(users).set({ login_attempts: loginAttempts, lock_until: lockUntil }).where(eq(users.id, userData.id))
    throw new Error('AUTH_INVALID_PASSWORD')
  }

  // 6. Successful login: clear lock state if needed
  if (loginAttempts !== 0 || lockUntil !== 0) {
    await db.update(users).set({ login_attempts: 0, lock_until: 0 }).where(eq(users.id, userData.id))
  }

  const { password, ...userWithoutPassword } = userData
  return userWithoutPassword
}
