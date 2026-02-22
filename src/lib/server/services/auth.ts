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
  return hex.slice(0, SALT_LENGTH)
}

async function hashPassword(pass: string, salt: string) {
  const buffer = (await scrypt(pass, salt, 64)) as Buffer
  return buffer.toString("hex")
}

async function createPassword(pass: string) {
  // 1. Generate salt
  const salt = generateSalt()
  // 2. Hash password
  const hashedPassword = await hashPassword(pass, salt)
  return hashedPassword + "." + salt
}

async function comparePassword(pass: string, hashed_pass: string) {
  let splitted = hashed_pass.split(".")
  let hash = splitted[0]
  let salt = splitted[1]

  let pass_hashed = await hashPassword(pass, salt)
  return pass_hashed == hash
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
