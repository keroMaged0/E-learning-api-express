import crypto from 'crypto';

export const hashCode = (code: string | number) =>
  crypto.createHash('sha256').update(`${code}`).digest('hex');
