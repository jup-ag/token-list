import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { canOnlyAddOneToken, detectDuplicateSymbol, detectDuplicates, validCommunityValidated, validMintAddress } from "./utils/validate";
import { ValidatedTokensData } from "./types/types";
import { parse } from "csv-parse/sync";
import fs from "fs";

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

  let duplicateSymbols;
  let duplicates;
  let attemptsToAddMoreTokens;
  let invalidMintAddresses;
  let notCommunityValidated;

  // duplicateSymbols = detectDuplicateSymbol(records);
  duplicates = detectDuplicates(records);
  attemptsToAddMoreTokens = canOnlyAddOneToken(records_0, records);
  invalidMintAddresses = validMintAddress(records);
  notCommunityValidated = validCommunityValidated(records);

  console.log("Duplicate Symbols:", duplicateSymbols);
  console.log("Duplicates:", duplicates);
  console.log("Attempts to Add More Tokens:", attemptsToAddMoreTokens);
  console.log("Invalid Mint Addresses:", invalidMintAddresses);
  console.log("Not Community Validated:", notCommunityValidated);
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
      silent: true
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }

  if (gitCmdError) {
    core.setFailed(gitCmdError);
  }
  return prevVersion;
}

function csvToRecords(r: any): ValidatedTokensData[] {
  const records: ValidatedTokensData[] = [];
  r.forEach((record: any, i: number) => {
    const rec: ValidatedTokensData = {
      Name: record.Name,
      Symbol: record.Symbol,
      Mint: record.Mint,
      Decimals: record.Decimals,
      LogoURI: record.LogoURI,
      "Community Validated": JSON.parse(record["Community Validated"]),
      Line: indexToLineNumber(i)
    };
    records.push(rec);
  });
  return records;
}