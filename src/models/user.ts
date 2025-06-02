import type { BaseUser } from "./user/base-user";
import type { ProfessionalUser } from "./user/professional-user";

export type User = BaseUser | ProfessionalUser;
