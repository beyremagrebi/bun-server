import type { Document, ObjectId } from "mongodb";

export interface User extends Document {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
