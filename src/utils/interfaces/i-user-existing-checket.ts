export interface UsernameExistenceChecker {
  usernameExists(username: string): Promise<boolean>;
}
