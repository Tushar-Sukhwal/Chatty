import { DecodedIdToken } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      /**
       * @description The decoded ID token from Firebase Auth
       * @type {DecodedIdToken}
       */
      user?: DecodedIdToken;
    }
  }
}
