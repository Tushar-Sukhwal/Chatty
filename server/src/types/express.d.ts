import { DecodedIdToken } from "firebase-admin/auth";


declare global {

  /**
   * @description Express request interface
   * @namespace Express
   * @interface Request
   * @property {DecodedIdToken} user - The decoded ID token
   */
  namespace Express {
    interface Request {
      /**
       * @description The decoded ID token
       * @type {DecodedIdToken}
       * @memberof Request
       */
      user?: DecodedIdToken;
    }
  }
}
