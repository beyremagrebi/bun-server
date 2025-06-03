import { ObjectId } from "mongodb";
import { CollectionsManager } from "../models/base/collection-manager";

export async function syncUserStorageDelta(
  userId: string | ObjectId,
  deltaBytes: number,
) {
  const id = typeof userId === "string" ? new ObjectId(userId) : userId;
  const now = new Date();
  const result =
    await CollectionsManager.userStrorageCollection.findOneAndUpdate(
      { userId: id },
      {
        $inc: { usedStorage: deltaBytes },
        $set: { updatedAt: now },
      },
      { upsert: true, returnDocument: "after" },
    );
  const totalUsed = result?.usedStorage ?? 0;
  const readable = formatFileSize(totalUsed);

  await CollectionsManager.userStrorageCollection.updateOne(
    { userId: id },
    { $set: { readableSize: readable } },
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
