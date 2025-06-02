import type { ObjectId } from "mongodb";
import type { BaseModel } from "../base/base-model";

export interface BaseUser extends BaseModel {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;

  image?: string;
  cover?: string;
  bio: string;
  city: string;
  adress: string;
  professionalTitle: string;
  postalCode: number;
  phone: string;

  skills?: [ObjectId];
}
