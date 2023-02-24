import * as github from "@actions/github";
import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { parseGitPatch } from "./parse";
import { validateGitPatch } from "./validate";
import { getValidated } from "./get-validated";
import { ValidatedSet } from "./types/types";

const { GITHUB_EVENT_PATH } = process.env;
const token = process.env.GITHUB_TOKEN as string;
const octokit = token && github.getOctokit(token);
// @ts-ignore
const GITHUB_EVENT = require(GITHUB_EVENT_PATH);

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
  } catch (error: any) {
    core.setFailed(error.message);
  }

  if (gitDiffError) {
    core.setFailed(gitDiffError);
  }


  let validatedSet: ValidatedSet;
  try {
    validatedSet = await getValidated();
    console.log('mints', validatedSet.names.size)
    parseGitPatch(gitDiff).forEach((patch) =>
    validateGitPatch(patch, validatedSet)
  );
  } catch (error: any) {
    core.setFailed(error.message);
  }
  

}

run();
