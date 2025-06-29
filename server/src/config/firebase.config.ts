import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import serviceAccount from "../config/firebase-service.json";

/**
 * Firebase Admin SDK initialisation.
 *
 * Loads service-account credentials from local `firebase-service.json` to
 * enable token verification & other server-side Firebase interactions.
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default admin;
