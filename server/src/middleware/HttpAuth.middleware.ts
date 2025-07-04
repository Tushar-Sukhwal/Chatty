import { NextFunction, Request, Response } from "express";
import admin from "../config/firebase.config";
import jwt from "jsonwebtoken";

/**
 * HTTP Authentication Middleware
 *
 * Verifies Authorization header against either:
 * 1. A JWT issued by this backend (`JWT_SECRET`).
 * 2. A Firebase ID token (via Firebase Admin SDK).
 *
 * On success, attaches the decoded token to `req.user` and calls `next()`.
 * On failure, returns 401 Unauthorized.
 */
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    let decodedToken: any;
    try {
      // Try to verify as our own JWT first
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      try {
        // If that fails, try to verify as a Firebase token
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (firebaseErr) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
