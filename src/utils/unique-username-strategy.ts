import type { UsernameGenerationStrategy } from "./interfaces/i-generation-strategy";
import type { UsernameExistenceChecker } from "./interfaces/i-user-existing-checket";

export class UniqueUsernameStrategy implements UsernameGenerationStrategy {
  constructor(private existenceChecker: UsernameExistenceChecker) {}

  generateBaseUsername(firstName: string, lastName: string): string {
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  }

  async makeUsernameUnique(baseUsername: string): Promise<string> {
    let uniqueUsername = baseUsername;
    let counter = 1;

    while (await this.existenceChecker.usernameExists(uniqueUsername)) {
      uniqueUsername = `${baseUsername}#${counter}`;
      counter++;
    }

    return uniqueUsername;
  }
}
