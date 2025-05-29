import type { OptionalUnlessRequiredId } from "mongodb";
import type { User } from "../../models/user";

export interface IAuthService {
  login(identifier: string, password: string): Promise<Response>;
  logout(token: string): Promise<Response>;
  sendOtp(email: string): Promise<Response>;
  verifyOtp(
    otp: string,
    userData: OptionalUnlessRequiredId<User>,
  ): Promise<Response>;
  refreshToken(refreshToken: string): Promise<Response>;
  forgetPassword(email: string): Promise<Response>;
  validateResetToken(email: string): Promise<Response>;
}
