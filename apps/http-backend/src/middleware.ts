import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config"
export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(403).json({
      message: "Unauthorized"
    })
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded) {
      (req as any).userId = (decoded as any).userId;
      next();
    } else {
      res.status(403).json({
        message: "Unauthorized"
      })
    }
  } catch (err) {
    res.status(403).json({
      message: "Unauthorized"
    })
  }
}