import * as github from "@actions/github";
import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { parseGitPatch } from "./parse";
import { validateGitPatch } from "./validate";
import { getValidated } from "./get-validated";
import { ValidatedSet, ValidationError } from "./types/types";

const token = process.env.GITHUB_TOKEN as string;
// const token = core.getInput('github-token', {required: true});

const octokit = token && github.getOctokit(token);

async function run(): Promise<void> {
  if (!octokit) {
    core.debug("No octokit client");
    return;
  }

  if (!github.context.payload.pull_request) {
    core.debug("Requires a pull request");
    return;
  }

  let gitDiff = "";
  let gitDiffError = "";

  try {
    console.log('Before exec!!')
    await exec("git", ["diff", "-U0", "--color=never"], {
      listeners: {
        stdout: (data: Buffer) => {
          gitDiff += data.toString();
        },
        stderr: (data: Buffer) => {
          gitDiffError += data.toString();
        },
      },
    });
    console.log(`After exec!!: ${gitDiff}`)
  } catch (error: any) {
    console.log('error getting git diff', error.message)
    core.debug(error.message)
    core.setFailed(error.message);
  }

  if (gitDiffError) {
    core.setFailed(gitDiffError);
  }

  core.info(`Git diff: ${gitDiff}`)
  console.log(`Git diff: ${gitDiff}`)

  let validatedSet: ValidatedSet;
  try {
    validatedSet = await getValidated();

    const errors: ValidationError[][] = []
    parseGitPatch(gitDiff).forEach((patch) => {
      const patchErrors = validateGitPatch(patch, validatedSet);
      if (patchErrors) {
        errors.push(patchErrors);
      }
    
    console.log(`Validation Error Summary:\n${errors.join("\n")}`)
    core.info(`Validation Error Summary:\n${errors.join("\n")}`)
    
    if (errors.length > 0) {
      core.setFailed(errors.join(","));
    }
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
