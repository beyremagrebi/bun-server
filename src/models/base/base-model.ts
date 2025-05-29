import type { Document, ObjectId } from "mongodb";

export abstract class BaseModel implements Document {
  _id!: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
