import { Readable } from "node:stream";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.ts";
import { ApiError } from "../utils/apiError.ts";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface UploadImageOptions {
  folder?: string;
  publicId?: string;
  transformation?: UploadApiOptions["transformation"];
  overwrite?: boolean;
}

export class CloudinaryService {
  /**
   * Uploads an image (Multer file, Buffer, base64 Data URI, or URL) to Cloudinary.
   */
  public static async uploadImage(
    file: Express.Multer.File | Buffer | string,
    options: UploadImageOptions = {}
  ): Promise<CloudinaryUploadResult> {
    if (!isCloudinaryConfigured()) {
      throw new ApiError(
        500,
        "Cloudinary credentials are not configured. Please verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
      );
    }

    const folder = options.folder || "learning_room/avatars";
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: "image",
      overwrite: options.overwrite ?? true,
      transformation: options.transformation || [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    // 1. Buffer Upload (via Stream)
    if (Buffer.isBuffer(file)) {
      return this.uploadStream(file, uploadOptions);
    }

    // 2. Multer File Object Upload
    if (typeof file === "object" && file !== null && "buffer" in file && Buffer.isBuffer(file.buffer)) {
      return this.uploadStream(file.buffer, uploadOptions);
    }

    // 3. File path on disk (if diskStorage was used)
    if (typeof file === "object" && file !== null && "path" in file && typeof file.path === "string") {
      try {
        const result = await cloudinary.uploader.upload(file.path, uploadOptions);
        return this.mapUploadResult(result);
      } catch (error: any) {
        throw new ApiError(500, `Cloudinary file upload failed: ${error?.message || error}`);
      }
    }

    // 4. String Upload (Base64 Data URI or Web URL)
    if (typeof file === "string") {
      try {
        const result = await cloudinary.uploader.upload(file, uploadOptions);
        return this.mapUploadResult(result);
      } catch (error: any) {
        throw new ApiError(500, `Cloudinary upload failed: ${error?.message || error}`);
      }
    }

    throw new ApiError(400, "Invalid image data provided for Cloudinary upload.");
  }

  /**
   * Streams a buffer directly to Cloudinary using upload_stream.
   */
  private static uploadStream(
    buffer: Buffer,
    options: UploadApiOptions
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            return reject(
              new ApiError(500, `Cloudinary stream upload error: ${error?.message || "Unknown error"}`)
            );
          }
          resolve(this.mapUploadResult(result));
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Deletes an image from Cloudinary by its public ID or Cloudinary URL.
   */
  public static async deleteImage(publicIdOrUrl: string): Promise<boolean> {
    if (!publicIdOrUrl || !isCloudinaryConfigured()) {
      return false;
    }

    const publicId = this.extractPublicId(publicIdOrUrl) || publicIdOrUrl;

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
      return result?.result === "ok";
    } catch (error) {
      console.warn(`[CloudinaryService] Failed to delete image (${publicId}):`, error);
      return false;
    }
  }

  /**
   * Extracts the public ID from a Cloudinary image URL.
   * Example:
   * https://res.cloudinary.com/cloud_name/image/upload/v123456789/learning_room/avatars/abc123xyz.png
   * -> "learning_room/avatars/abc123xyz"
   */
  public static extractPublicId(url: string): string | null {
    if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
      return null;
    }

    try {
      const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
      const matches = url.match(regex);
      return matches?.[1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Standardizes Cloudinary API response into CloudinaryUploadResult.
   */
  private static mapUploadResult(result: UploadApiResponse): CloudinaryUploadResult {
    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  }
}

export default CloudinaryService;

