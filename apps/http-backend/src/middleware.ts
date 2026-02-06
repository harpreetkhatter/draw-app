import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config"

export interface AuthRequest extends Request {
  userId?: string;
}

export function middleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(403).json({
      message: "Unauthorized - No token provided"
    })
    return;
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
      next();
    } else {
      res.status(403).json({
        message: "Unauthorized - Invalid token"
      })
    }
  } catch (err) {
    res.status(403).json({
      message: "Unauthorized - Token verification failed"
    })
  }
}