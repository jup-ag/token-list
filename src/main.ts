import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { parseGitPatch } from "./utils/parse";
import { validateGitPatch } from "./utils/validate";
import { getValidated } from "./utils/get-jup-strict";
import { ValidatedSet, ValidationError } from "./types/types";
import { parse } from "csv-parse/sync";
import fs from "fs";
import assert from "assert";

function validateValidatedTokensCsv() {
  const records = parse(fs.readFileSync("validated-tokens.csv", "utf8"), {
    columns: true,
    skip_empty_lines: true,
  });
  assert.deepStrictEqual(Object.keys(records[0]), [
    "Name",
    "Symbol",
    "Mint",
    "Decimals",
    "LogoURI",
    "Community Validated",
  ]);
}

// Validates diff between validated-tokens.csv in the branch vs origin/main
async function getDiffAndValidate(): Promise<void> {
  let gitDiff = "";
  let gitDiffError = "";

  try {
    await exec("git", ["diff", "origin/main", "validated-tokens.csv"], {
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

  // Get Jup tokens that are in the strict list to check for duplicates.
  let validatedSet: ValidatedSet;
  try {
    validatedSet = await getValidated();

    const errors: ValidationError[][] = [];

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

validateValidatedTokensCsv();
// getDiffAndValidate();
