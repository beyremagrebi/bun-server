import type { BaseModel } from "./base/base-model";

export interface User extends BaseModel {
  firstName: string;
  lastName: string;
  identifier?: string;
  userName: string;
  email: string;
  password: string;
}
