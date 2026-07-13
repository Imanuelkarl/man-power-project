import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface TokenPayload {
  id?: string;
  role?: 'admin' | 'manufacturer' | 'investor' | string;
  [key: string]: any;
}

const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return null;

  const parts = authHeader.toString().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;

  return parts[1];
};

const verifyToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
};

const roleMiddleware = (...allowedRoles: Array<'admin' | 'manufacturer' | 'investor'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.role) {
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
export const manufacturerOnly = roleMiddleware('manufacturer');
export const investorOnly = roleMiddleware('investor');
export const allowRoles = roleMiddleware;
