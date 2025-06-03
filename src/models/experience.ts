import type { ObjectId } from "mongodb";

export interface Experience {
  userId: ObjectId;
  post: string;
  enterprise: string;
  place: string;
  startDate: Date;
  endDate: Date;
}
