import type { BaseModel } from "./base/base-model";

export interface Post extends BaseModel {
  label: string;
  description: string;
}
