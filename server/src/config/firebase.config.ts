import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import serviceAccount from "../config/chatty-5d50d-firebase-adminsdk-fbsvc-3540b8ad04.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default admin;
