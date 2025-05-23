import { DatabaseUsernameExistenceChecker } from "./database-username-existing-checker";
import { SafeUsernameStrategy } from "./safe-username-strategy";
import { UniqueUsernameStrategy } from "./unique-username-strategy";
import { UsernameGenerator } from "./user-name-generator";

export class UtilsFunc {
  static createUsernameGenerator(isSafe: boolean): UsernameGenerator {
    const existenceChecker = new DatabaseUsernameExistenceChecker();

    const strategy = isSafe
      ? new SafeUsernameStrategy()
      : new UniqueUsernameStrategy(existenceChecker);

    return new UsernameGenerator(strategy);
  }
}
