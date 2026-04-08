import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { scrypt as _scrypt, randomBytes, createHash } from 'crypto'
import { comparePassword, createPassword } from './password'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET!
const LOGIN_ATTEMPT_LIMIT = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 hour

type Payload = {
  id?: number | string,
  email?: string,
  role?: string,
};


function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createToken(payload: Payload) {
  return jwt.sign(payload, JWT_SECRET)
}

export function verifyToken(token: string | undefined): Payload | null {
  if (!token) {
    return null
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)

    if (typeof payload !== 'object' || payload === null) {
      return null
    }

    const typedPayload = payload as { id?: number | string; email?: string; role?: string }
    if (typeof typedPayload.email !== 'string' || typeof typedPayload.role !== 'string') {
      return null
    }

    if (typeof typedPayload.id !== 'number' && typeof typedPayload.id !== 'string') {
      return null
    }

    return { id: typedPayload.id, email: typedPayload.email, role: typedPayload.role }
  } catch {
    return null
  }
}

export async function createResetToken(email: string) {
  const user = await db.select().from(users).where(eq(users.email, email))
  if (user.length === 0) {
    return null
  }

  const token = randomBytes(32).toString('hex')
  const tokenHash = hashResetToken(token)
  const expires = Date.now() + TOKEN_EXPIRATION; // 1 hour

  await db.update(users).set({
    reset_token_hash: tokenHash,
    reset_token_expires: expires,
  }).where(eq(users.id, user[0].id))

  return token
}

export async function verifyResetToken(token: string | undefined) {
  if (!token) {
    return null
  }

  const tokenHash = hashResetToken(token)
  const user = await db.select().from(users).where(eq(users.reset_token_hash, tokenHash))
  if (user.length === 0) {
    return null
  }

  const userData = user[0]
  if (userData.reset_token_expires < Date.now()) {
    return null
  }

  const { password, ...userWithoutPassword } = userData
  return userWithoutPassword
}

export async function resetPassword(token: string, pass: string) {
  const user = await verifyResetToken(token)
  if (!user) {
    throw new Error('AUTH_RESET_TOKEN_INVALID')
  }

  const hashedPassword = await createPassword(pass)
  await db.update(users).set({
    password: hashedPassword,
    reset_token_hash: null,
    reset_token_expires: 0,
  }).where(eq(users.id, user.id))

  return true
}

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
    role: 'user',
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

export async function getUserLockTime(email: string): Promise<number> {
  try {
    // 1. Find the user by email
    const user = await db.select().from(users).where(eq(users.email, email))

    // 2. If user doesn't exist, return null
    if (user.length == 0) {
      throw new Error("AUTH_USER_NOT_FOUND")
    }

    return user[0].lock_until;
  } catch {
    return 0
  }
}
