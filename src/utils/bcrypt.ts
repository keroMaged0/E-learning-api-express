import { hash, compare } from 'bcryptjs';
import { env } from '../config/env';


export const hashPassword = async (pwd: string): Promise<string> => {
  const hashedPwd = await hash(pwd + env.bcrypt.paper, env.bcrypt.salt);
  return hashedPwd;
};

export const comparePassword = async (pwd: string, hashed: string): Promise<boolean> => {
  const isMatch = await compare(pwd + env.bcrypt.paper, hashed);
  return isMatch;
};
