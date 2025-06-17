import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import serviceAccount from "@/config/firebase-service.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default admin;
