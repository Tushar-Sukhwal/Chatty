import User from "../models/User.model";

const userIdHelper = (email: string): string => {
  // Remove everything after @ and replace special characters
  const username = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);

  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 6);

  return `${username}${randomSuffix}`;
};

const generateUserId = async (email: string): Promise<string> => {
  let userId = userIdHelper(email);
  while (await User.findOne({ userId })) {
    userId = userIdHelper(email);
  }
  return userId;
};

export default generateUserId;
