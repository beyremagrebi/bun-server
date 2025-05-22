import type { Document, ObjectId } from "mongodb";

export interface Post extends Document {
  _id?: ObjectId;
  label: string;
  description: string;
}
