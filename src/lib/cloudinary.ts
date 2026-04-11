import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Cloudinary will automatically use CLOUDINARY_URL from environment if available.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split("@")[1] || "dly7lqtr3",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadType = "business_logo" | "business_banner" | "avatar";

interface SignedParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
}

/**
 * Helper to determine folder and public ID based on type and identifier
 */
function getUploadConfig(type: UploadType, identifier: string) {
  let folder = "reviewfunnel";
  let publicId = identifier;

  switch (type) {
    case "business_logo":
      folder = `public/${identifier}`;
      publicId = `logo`;
      break;
    case "business_banner":
      folder = "reviewfunnel/business_banners";
      publicId = `${identifier}_banner`;
      break;
    case "avatar":
      folder = "reviewfunnel/avatars";
      publicId = `user_${identifier}`;
      break;
  }

  return { folder, publicId };
}

/**
 * Generates signed parameters for a client-side upload to Cloudinary.
 */
export function generateSignedUploadParams(
  type: UploadType,
  identifier: string // business slug for logos/banners, userId for avatars
): SignedParams {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudName = cloudinary.config().cloud_name!;
  const apiKey = cloudinary.config().api_key!;
  const apiSecret = cloudinary.config().api_secret!;

  const { folder, publicId } = getUploadConfig(type, identifier);

  // Parameters to be signed
  const paramsToSign = {
    timestamp,
    folder,
    public_id: publicId,
    overwrite: true,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

/**
 * Uploads a file directly from the server to Cloudinary.
 * @param file - File path, Buffer, base64 string, or remote URL
 */
export async function uploadToCloudinary(
  file: string,
  type: UploadType,
  identifier: string
): Promise<UploadApiResponse> {
  const { folder, publicId } = getUploadConfig(type, identifier);

  return await cloudinary.uploader.upload(file, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: "auto",
  });
}
