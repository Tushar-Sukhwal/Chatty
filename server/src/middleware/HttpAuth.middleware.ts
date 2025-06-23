import { NextFunction, Request, Response } from "express";
import admin from "../config/firebase.config";
import jwt from "jsonwebtoken";

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

    // @ts-ignore

    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
