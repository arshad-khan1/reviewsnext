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
 * Uploads a file directly from the server to Cloudinary using native fetch to bypass SDK network bugs.
 * @param file - base64 string
 */
export async function uploadToCloudinary(
  file: string,
  type: UploadType,
  identifier: string
): Promise<UploadApiResponse> {
  const { folder, publicId } = getUploadConfig(type, identifier);
  
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudName = process.env.CLOUDINARY_URL?.split("@")[1] || cloudinary.config().cloud_name;
  const apiKey = process.env.CLOUDINARY_API_KEY || cloudinary.config().api_key;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || cloudinary.config().api_secret;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary configuration");
  }
  
  const paramsToSign = {
    timestamp,
    folder,
    public_id: publicId,
    overwrite: true,
  };
  
  // Create signature synchronously using SDK utility
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
  
  // Use Next.js native FormData instead of buggy Node SDK https stream
  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", timestamp.toString());
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("overwrite", "true");
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
    // Add extra 60s timeout handling natively using AbortController if needed, but fetch defaults usually work.
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[CLOUDINARY NATIVE FETCH ERROR]", errText);
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }
  
  return res.json();
}
