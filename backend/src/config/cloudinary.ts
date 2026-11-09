import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.ts";

/**
 * Checks whether valid Cloudinary credentials have been configured.
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    env.CLOUDINARY_URL ||
      (env.CLOUDINARY_CLOUD_NAME &&
        env.CLOUDINARY_API_KEY &&
        env.CLOUDINARY_API_SECRET)
  );
};

// Initialize Cloudinary instance if credentials are provided
if (isCloudinaryConfigured()) {
  if (env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: env.CLOUDINARY_URL,
      secure: true,
    });
  } else {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

export { cloudinary };
export default cloudinary;

