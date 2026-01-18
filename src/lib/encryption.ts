import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure this key is 32 bytes. In production, this must be set in .env
// For development, we fallback to a hardcoded key if not present (NOT RECOMMENDED for prod)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    if (!text) return '';
    const textParts = text.split(':');
    const ivPart = textParts.shift();
    if (!ivPart) return '';
    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
