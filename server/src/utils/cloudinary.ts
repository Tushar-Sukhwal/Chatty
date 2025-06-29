import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  original_filename?: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Cloudinary Utilities
 *
 * Provides helper methods to:
 *   • Upload local files to a structured folder on Cloudinary with automatic
 *     resource-type detection (image / video / raw).
 *   • Delete a Cloudinary asset by `public_id`.
 *   • Infer high-level message type (`image`, `video`, `audio`, `document`) from
 *     Cloudinary metadata – consumed by the messaging UI.
 */
const uploadOnCloudinary = async (
  localFilePath: string,
  folder: string = "chatty-files"
): Promise<CloudinaryResponse | null> => {
  try {
    if (!localFilePath) return null;

    // Determine resource type based on file extension
    const fileExtension = localFilePath.split(".").pop()?.toLowerCase();
    let resourceType: "image" | "video" | "raw" = "raw";

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];

    if (imageExtensions.includes(fileExtension || "")) {
      resourceType = "image";
    } else if (videoExtensions.includes(fileExtension || "")) {
      resourceType = "video";
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder: folder,
      use_filename: true,
      unique_filename: true, // Generate unique filenames to avoid conflicts
    });

    // Delete the local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.log("File uploaded to Cloudinary:", response.secure_url);

    return {
      public_id: response.public_id,
      secure_url: response.secure_url,
      original_filename: response.original_filename,
      format: response.format,
      resource_type: response.resource_type,
      bytes: response.bytes,
      width: response.width,
      height: response.height,
      duration: response.duration,
    };
  } catch (error) {
    // Delete the local file in case of error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Error uploading file to Cloudinary:", error);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary:", result);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};

const getFileType = (
  resourceType: string,
  format: string | undefined
): "image" | "video" | "document" | "audio" => {
  if (resourceType === "image") return "image";
  if (resourceType === "video") return "video";

  const audioFormats = ["mp3", "wav", "mpeg", "aac", "ogg"];
  if (format && audioFormats.includes(format.toLowerCase())) return "audio";

  return "document";
};

export default {
  uploadOnCloudinary,
  deleteFromCloudinary,
  getFileType,
};
