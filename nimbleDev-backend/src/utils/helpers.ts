import * as crypto from 'crypto';

export function hashString(input: string, algorithm: string = 'sha256'): string {
  // Create a hash object using the specified algorithm
  const hash = crypto.createHash(algorithm);

  // Update the hash with the input string
  hash.update(input);

  // Return the resulting hash as a hexadecimal string
  return hash.digest('hex');
}
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15);
}
