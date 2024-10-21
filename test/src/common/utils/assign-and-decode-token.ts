import * as jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET ?? 'secret-key';
const expirationTime = process.env.JWT_EXPIRATION ?? '30d';
const expiresIn = '1h';

export interface TokenInterface {
  email: string;
  id: string;
  isAdmin: boolean;
}
export const signToken = (user: TokenInterface): string => {
  try {
    const token = jwt.sign(user, secretKey, { expiresIn: expirationTime });
    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const verifyUserToken = (userId: string): string => {
  try {
    const payload = {
      id: userId,
      purpose: 'verifyLink',
    };
    const options = {
      expiresIn,
    };

    return jwt.sign(payload, secretKey, options);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const tokenDecoder = (token: string): TokenInterface => {
  try {
    return jwt.verify(token, secretKey) as TokenInterface;
  } catch (error) {
    throw new Error(error);
  }
};
