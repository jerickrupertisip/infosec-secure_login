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

export async function createPassword(pass: string) {
  // 1. Generate salt
  const salt = generateSalt()
  // 2. Hash password
  const hashedPassword = await hashPassword(pass, salt)
  return hashedPassword + "." + salt
}

export async function comparePassword(pass: string, hashed_pass: string) {
  let splitted = hashed_pass.split(".")
  let hash = splitted[0]
  let salt = splitted[1]

  let pass_hashed = await hashPassword(pass, salt)
  return pass_hashed == hash
}