import type { BaseModel } from "./base/base-model";

export interface User extends BaseModel {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
}
