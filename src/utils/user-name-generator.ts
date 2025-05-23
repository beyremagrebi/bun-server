import type { UsernameGenerationStrategy } from "./interfaces/i-generation-strategy";

export class UsernameGenerator {
  private strategy: UsernameGenerationStrategy;

  constructor(strategy: UsernameGenerationStrategy) {
    this.strategy = strategy;
  }

  async generateUserName(firstName: string, lastName: string): Promise<string> {
    const baseUsername = this.strategy.generateBaseUsername(
      firstName,
      lastName,
    );
    return this.strategy.makeUsernameUnique(baseUsername);
  }
}
