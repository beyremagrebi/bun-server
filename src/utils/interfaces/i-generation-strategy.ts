export interface UsernameGenerationStrategy {
  generateBaseUsername(firstName: string, lastName: string): string;
  makeUsernameUnique(baseUsername: string): Promise<string>;
}
