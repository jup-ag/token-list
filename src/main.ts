import * as core from "@actions/core";
import { validateValidatedTokensCsv } from "./logic";
// Github Actions entrypoint
(async () => {
  try {
    await validateValidatedTokensCsv("validated-tokens.csv");
  }
  catch (error: any) {
    core.setFailed(error.message);
    console.log(error.message)
  }
})();
