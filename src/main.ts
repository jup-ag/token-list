import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { canOnlyAddOneToken, detectDuplicateSymbol, detectDuplicateMints as detectDuplicateMints, validMintAddress, noEditsToPreviousLinesAllowed } from "./utils/validate";
import { ValidatedTokensData } from "./types/types";
import { indexToLineNumber } from "./utils/validate";
import { parse } from "csv-parse/sync";
import fs from "fs";

(async () => {
  try {
    await validateValidatedTokensCsv();
  }
  catch (error: any) {
    core.setFailed(error.message);
    console.log(error.message)
  }
})();

async function validateValidatedTokensCsv() {
  const [records, recordsRaw] = parseCsv("validated-tokens.csv");

  const recordsPreviousRaw = await gitPreviousVersion("validated-tokens.csv");
  fs.writeFileSync(".validated-tokens-0.csv", recordsPreviousRaw);
  const [recordsPrevious, _] = parseCsv(".validated-tokens-0.csv")

  let duplicateSymbols;
  let duplicateMints;
  let attemptsToAddMultipleTokens;
  let invalidMintAddresses;
  let notCommunityValidated;
  let noEditsAllowed;

  duplicateSymbols = detectDuplicateSymbol(recordsPrevious, records);
  duplicateMints = detectDuplicateMints(records);
  attemptsToAddMultipleTokens = canOnlyAddOneToken(recordsPrevious, records)
  invalidMintAddresses = validMintAddress(records);
  noEditsAllowed = noEditsToPreviousLinesAllowed(recordsPrevious, records);
  // notCommunityValidated = validCommunityValidated(records);

  console.log("No More Duplicate Symbols:", duplicateSymbols);
  console.log("Duplicate Mints:", duplicateMints);
  console.log("Attempts to Add Multiple Tokens:", attemptsToAddMultipleTokens);
  console.log("Invalid Mint Addresses:", invalidMintAddresses);
  console.log("Not Community Validated:", notCommunityValidated);
  console.log("Edits to Existing Tokens:", noEditsAllowed);
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

function parseCsv(filename: string): [ValidatedTokensData[], string] {
  const recordsRaw = fs.readFileSync(filename, "utf8")
  const r = parse(recordsRaw, {
    columns: true,
    skip_empty_lines: true,
  });
  const records = csvToRecords(r);
  return [records, recordsRaw];
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
