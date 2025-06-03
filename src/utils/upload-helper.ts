import { existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
// <-- you need to implement this
import { ObjectId } from "mongodb"; // or mongoose.Types.ObjectId if using Mongoose
import { syncUserStorageDelta } from "./asyn-user-storage";

export interface UploadResult {
  buffer: Uint8Array;
  fileName: string;
  mimeType: string;
  fullPath?: string;
  size?: number;
}

interface HandleFileUploadOptions {
  fieldName: string;
  storePath: string;
  fileName?: string | ((index: number, originalName: string) => string);
  multiple?: boolean;
  writeToDisk?: boolean;
  userId?: string | ObjectId; // <-- new optional field
}

function getExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0] : "";
}

export async function handleFileUpload(
  formData: FormData,
  options: HandleFileUploadOptions,
): Promise<UploadResult | UploadResult[] | null> {
  if (!existsSync(options.storePath)) {
    mkdirSync(options.storePath, { recursive: true });
  }

  const writeToDisk = options.writeToDisk ?? false;
  const userId = options.userId?.toString(); // normalize

  if (options.multiple === true) {
    const files = formData.getAll(options.fieldName);
    if (!files.length) return null;

    const results: UploadResult[] = [];
    let totalBytes = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(file);
      if (!(file instanceof File)) return null;
      if (!file.name?.trim()) return null;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const originalExtension = getExtension(file.name);

      const baseFileName =
        typeof options.fileName === "function"
          ? options.fileName(i, file.name)
          : options.fileName || file.name || `uploaded_file_${i}`;

      const safeFileName = baseFileName.endsWith(originalExtension)
        ? baseFileName
        : baseFileName + originalExtension;

      let fullPath: string | undefined;
      if (writeToDisk) {
        fullPath = join(options.storePath, safeFileName);
        await Bun.write(fullPath, buffer);
      }

      results.push({
        buffer,
        fileName: safeFileName,
        mimeType: file.type,
        fullPath,
        size: buffer.length,
      });

      totalBytes += buffer.length;
    }

    if (writeToDisk && userId && totalBytes > 0) {
      await syncUserStorageDelta(userId, totalBytes);
    }

    return results;
  } else {
    const file = formData.get(options.fieldName);
    if (!file || !(file instanceof File)) return null;
    if (!file.name?.trim()) return null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const originalExtension = getExtension(file.name);
    console.log(file);
    const baseFileName =
      typeof options.fileName === "string"
        ? options.fileName
        : file.name || "uploaded_file";

    const safeFileName = baseFileName.endsWith(originalExtension)
      ? baseFileName
      : baseFileName + originalExtension;

    let fullPath: string | undefined;
    if (writeToDisk) {
      fullPath = join(options.storePath, safeFileName);
      await Bun.write(fullPath, buffer);
    }

    if (writeToDisk && userId && buffer.length > 0) {
      await syncUserStorageDelta(userId, buffer.length);
    }

    return {
      buffer,
      fileName: safeFileName,
      mimeType: file.type,
      fullPath,
      size: buffer.length,
    };
  }
}

export function deleteFiles(
  paths: string | string[] | undefined,
  basePath: string,
): string[] {
  if (!paths) return [];

  const fileList = Array.isArray(paths) ? paths : [paths];
  const deleted: string[] = [];

  for (const fileName of fileList) {
    const fullPath = join(basePath, fileName);
    if (existsSync(fullPath)) {
      try {
        unlinkSync(fullPath);
        deleted.push(fileName);
      } catch (err) {
        console.error(`Failed to delete ${fileName}:`, err);
      }
    } else {
      console.warn(`File not found: ${fileName}`);
    }
  }

  return deleted;
}
