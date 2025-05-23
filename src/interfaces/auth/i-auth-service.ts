export interface IAuthService {
  login(identifier: string, password: string): Promise<Response>;
  logout(token: string): Promise<Response>;
  refreshToken(refreshToken: string): Promise<Response>;
}
