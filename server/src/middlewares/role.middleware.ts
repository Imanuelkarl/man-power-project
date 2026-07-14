import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthRequest } from './auth.middleware.js';

interface TokenPayload {
  id?: string;
  role?: 'admin' | 'manufacturer' | 'investor' | string;
  [key: string]: any;
}

const getTokenFromRequest = (req: Request,res: Response): string | undefined => {
  const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    return token;
};

const verifyToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    const decode =jwt.verify(token,secret);;
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
};

const roleMiddleware = (...allowedRoles: Array<'admin' | 'manufacturer' | 'investor'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req,res);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const payload = req.user?req.user: verifyToken(token);
    if (!payload || !payload.role) {
      console.log(req.user);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (!allowedRoles.includes(payload.role as 'admin' | 'manufacturer' | 'investor')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    (req as any).user = payload;
    next();
  };
};

export const adminOnly = roleMiddleware('admin');
export const manufacturerOnly = roleMiddleware('manufacturer','admin');
export const investorOnly = roleMiddleware('investor','admin');
export const allowRoles = roleMiddleware;
