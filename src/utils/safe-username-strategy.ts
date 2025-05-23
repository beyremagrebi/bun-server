import type { UsernameGenerationStrategy } from "../interfaces/i-generation-strategy";

export class SafeUsernameStrategy implements UsernameGenerationStrategy {
  generateBaseUsername(firstName: string, lastName: string): string {
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  }

  async makeUsernameUnique(baseUsername: string): Promise<string> {
    return baseUsername;
  }
}
