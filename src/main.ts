import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { parseGitPatch } from "./utils/parse";
import { canOnlyAddOneToken, detectDuplicateSymbol } from "./utils/validate";
import { getValidated } from "./utils/get-jup-strict";
import { Record, ValidatedSet, ValidationError } from "./types/types";
import { parse } from "csv-parse/sync";
import fs from "fs";
import assert from "assert";

(async () => {
  try {
    await validateValidatedTokensCsv();
  }
  catch (error: any) {
    core.setFailed(error.message);
  }
})();

async function validateValidatedTokensCsv() {
  const r = parse(fs.readFileSync("validated-tokens.csv", "utf8"), {
    columns: true,
    skip_empty_lines: true,
  });
  const records = csvToRecords(r);

  const r0_raw = await gitPreviousVersion("validated-tokens.csv");
  const r0 = parse(r0_raw, {
    columns: true,
    skip_empty_lines: true,
  });
  const records_0 = csvToRecords(r0);

  detectDuplicateSymbol(records);
  canOnlyAddOneToken(records_0, records);
}

// Get previous version of validated-tokens.csv from last commit
async function gitPreviousVersion(path: string): Promise<any> {
  let prevVersion = "";
  let gitCmdError = "";

  try {
    await exec("git", ["show", `origin/main:${path}`], {
      listeners: {
        stdout: (data: Buffer) => {
          prevVersion += data.toString();
        },
        stderr: (data: Buffer) => {
          gitCmdError += data.toString();
        },
      },
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }

  if (gitCmdError) {
    core.setFailed(gitCmdError);
  }
  return prevVersion;
}

function csvToRecords(r: any): Record[] {
  const records: Record[] = [];
  r.forEach((record: any) => {
    const rec: Record = {
      Name: record.Name,
      Symbol: record.Symbol,
      Mint: record.Mint,
      Decimals: record.Decimals,
      LogoURI: record.LogoURI,
      "Community Validated": record["Community Validated"],
    };
    records.push(rec);
  });
  return records;
}