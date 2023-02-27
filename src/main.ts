import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { parseGitPatch } from "./parse";
import { validateGitPatch } from "./validate";
import { getValidated } from "./get-validated";
import { ValidatedSet, ValidationError } from "./types/types";

async function run(): Promise<void> {

  let gitDiff = "";
  let gitDiffError = "";

  try {
    await exec("git", ["diff", "origin/main", "-U0", "--color=never"], {
      listeners: {
        stdout: (data: Buffer) => {
          gitDiff += data.toString();
        },
        stderr: (data: Buffer) => {
          gitDiffError += data.toString();
        },
      },
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }

  if (gitDiffError) {
    core.setFailed(gitDiffError);
  }

  // core.debug(`Git diff: ${gitDiff}`)

  let validatedSet: ValidatedSet;
  try {
    validatedSet = await getValidated();

    const errors: ValidationError[][] = []

    parseGitPatch(gitDiff).forEach((patch) => {
      const patchErrors = validateGitPatch(patch, validatedSet);
      if (patchErrors && patchErrors.length > 0) {
        errors.push(patchErrors);
      }
    });
        
    if (errors.length > 0) {
      core.setFailed(errors.join(","));
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
