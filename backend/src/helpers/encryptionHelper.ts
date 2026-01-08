import crypto from 'crypto';
import { ENV_VARIABLE } from '../configs';

const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts text using AES-256-CBC encryption
 * @param text - Plain text to encrypt
 * @returns Encrypted text in format: iv:encryptedData
 */
export function encrypt(text: string): string {
  const encryptionKey = ENV_VARIABLE.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables');
  }

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(encryptionKey),
    iv
  );

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV and encrypted data separated by colon
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts text that was encrypted using the encrypt function
 * @param encryptedText - Encrypted text in format: iv:encryptedData
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  const encryptionKey = ENV_VARIABLE.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables');
  }

  // Split IV and encrypted data
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = parts[1];

  // Create decipher
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(encryptionKey),
    iv
  );

  // Decrypt the data
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypts an object by converting it to JSON first
 * @param obj - Object to encrypt
 * @returns Encrypted string
 */
export function encryptObject(obj: Record<string, any>): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts an encrypted string back to an object
 * @param encryptedText - Encrypted text
 * @returns Decrypted object
 */
export function decryptObject<T = Record<string, any>>(
  encryptedText: string
): T {
  const decrypted = decrypt(encryptedText);
  return JSON.parse(decrypted) as T;
}
