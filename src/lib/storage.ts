import { v2 as cloudinary } from "cloudinary";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const isCloudinary = process.env.STORAGE_PROVIDER === "cloudinary";

if (isCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ fileKey: string; fileUrl: string }> {
  if (isCloudinary) {
    const pid = `medical-gallery/${uuidv4()}`;

    const result = await new Promise<{ public_id: string; secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              // Upload everything as "image" — Cloudinary supports PDF as image type
              // This serves PDF with proper Content-Type without auth issues
              resource_type: "image",
              public_id: pid,
              overwrite: false,
            },
            (error, res) => {
              if (error || !res) reject(error ?? new Error("Upload failed"));
              else resolve(res as { public_id: string; secure_url: string });
            }
          )
          .end(buffer);
      }
    );

    return { fileKey: result.public_id, fileUrl: result.secure_url };
  }

  // Local storage fallback
  const ext = path.extname(originalName);
  const fileKey = `uploads/${uuidv4()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const safeFilename = path.basename(fileKey);
  const localPath = path.join(uploadDir, safeFilename);
  await writeFile(localPath, buffer);
  return { fileKey, fileUrl: `/uploads/${safeFilename}` };
}

export async function deleteFile(fileKey: string): Promise<void> {
  if (isCloudinary) {
    await cloudinary.uploader.destroy(fileKey, { resource_type: "image" });
    return;
  }

  try {
    const localPath = path.join(process.cwd(), "public", "uploads", path.basename(fileKey));
    await unlink(localPath);
  } catch {
    // ignore
  }
}
