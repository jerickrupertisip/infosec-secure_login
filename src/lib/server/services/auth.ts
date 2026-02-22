import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { hash } from 'zod'
import crypto from 'crypto'
import { scrypt as _scrypt } from 'crypto'
import { promisify } from 'util'
const scrypt = promisify(_scrypt)

const SALT_LENGTH = 12

function generateSalt() {
  const bytes = Math.ceil(SALT_LENGTH / 2)
  const hex = crypto.randomBytes(bytes).toString("hex")
  return hex.slice(0, length)
}

async function hashPassword(pass: string, salt: string) {
  const buffer = (await scrypt(pass, salt, 64)) as Buffer
  return buffer.toString("hex")
}

async function createPassword(pass: string) {
  // 1. Generate salt
  const salt = generateSalt()
  // 2. Hash password
  const hashedPassword = hashPassword(pass, salt)
  return hashedPassword
}

export async function createUser(email: string, pass: string) {
  // 1. Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email))
  if (existing) {
    throw new Error('User already exists')
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
  if (!user?.[0]) {
    throw new Error("AUTH_USER_NOT_FOUND")
  }

  const hashedPassword = await createPassword(pass)

  // 3. Compare the provided password with the stored hash
  const isValid = hashedPassword == user[0].password

  if (!isValid) {
    throw new Error('AUTH_INVALID_PASSWORD')
  }

  // 4. Return the user (excluding the password for security)
  const { password, ...userWithoutPassword } = user[0]
  return userWithoutPassword
}
