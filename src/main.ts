import * as core from "@actions/core";
import { validateValidatedTokensCsv } from "./logic";
// Github Actions entrypoint
(async () => {
  try {
    const returnCode = await validateValidatedTokensCsv("validated-tokens.csv");
    process.exit(returnCode);
  }
  catch (error: any) {
    core.setFailed(error.message);
    console.log(error.message)
  }
})();
