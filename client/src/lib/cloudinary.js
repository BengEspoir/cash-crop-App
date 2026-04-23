const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const DEFAULT_TRANSFORMS = "f_auto,q_auto";

export const hasCloudinary = Boolean(CLOUD_NAME);

/**
 * Build a Cloudinary delivery URL for a given public id.
 * Falls back to returning the public id as-is if Cloudinary is not configured
 * (so callers can pass in a full URL when no Cloudinary is set up).
 */
export function buildCldUrl(publicId, options = {}) {
  if (!publicId) return "";

  if (/^https?:\/\//.test(publicId)) {
    return publicId;
  }

  if (!CLOUD_NAME) {
    return publicId;
  }

  const parts = [DEFAULT_TRANSFORMS];
  if (options.w) parts.push(`w_${options.w}`);
  if (options.h) parts.push(`h_${options.h}`);
  if (options.c) parts.push(`c_${options.c}`);
  if (options.g) parts.push(`g_${options.g}`);
  if (options.dpr) parts.push(`dpr_${options.dpr}`);
  if (options.e) parts.push(`e_${options.e}`);
  if (options.extra) parts.push(options.extra);

  const transform = parts.join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}

/**
 * Unsigned client upload helper. Requires:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 */
export async function uploadToCloudinary(file, { folder, onProgress } = {}) {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!CLOUD_NAME || !preset) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  if (folder) form.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded / event.total);
        }
      };
    }
    xhr.send(form);
  });
}
