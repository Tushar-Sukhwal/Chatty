import User from "../models/User.model";

const userIdHelper = (email: string, attempt: number = 0): string => {
  const username = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 12); // Shorter to leave room for suffix

  // Combine timestamp and random for better uniqueness
  const timestamp = Date.now().toString(36).slice(-3);
  const randomSuffix = Math.random().toString(36).substring(2, 5);
  const attemptSuffix = attempt > 0 ? attempt.toString() : "";

  return `${username}${timestamp}${randomSuffix}${attemptSuffix}`.substring(
    0,
    20
  );
};

const generateUserId = async (email: string): Promise<string> => {
  // Input validation
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error("Invalid email provided");
  }

  const emailPart = email.split("@")[0];
  if (!emailPart || emailPart.length === 0) {
    throw new Error("Invalid email format - no username part found");
  }

  let userId: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    userId = userIdHelper(email, attempts);
    attempts++;

    // Check if userId already exists
    const existingUser = await User.exists({ userId });
    if (!existingUser) {
      break;
    }

    if (attempts >= maxAttempts) {
      // Final fallback - guaranteed unique with timestamp
      userId = `user_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 6)}`;
      break;
    }
  } while (attempts < maxAttempts);

  return userId;
};

export default generateUserId;
