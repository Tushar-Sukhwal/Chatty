import mongoose from "mongoose";

/**
 * MongoDB Connection Helper
 *
 * Establishes a connection using the URI in `DATABASE_URL` env var and exits the
 * process on unrecoverable error. This function should be invoked once during
 * the bootstrapping stage.
 */
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
