import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { Logger } from "../src/config/logger";

const hookPath = join(".git", "hooks", "pre-commit");
if (Bun.env.MODEV !== "DEV") {
  process.exit(0);
}
if (!existsSync(hookPath)) {
  Logger.error("Pre-commit hook not installed.", false);
  Logger.info("Run: pip install pre-commit && pre-commit install", false);
  process.exit(1);
}

try {
  execSync("pre-commit --version");
} catch {
  Logger.error(
    "`pre-commit` not found. Install it with: pip install pre-commit",
    false,
  );
  process.exit(1);
}
// "predev": "bun scripts/check-pre-commit.ts",
