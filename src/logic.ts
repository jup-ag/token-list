import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { detectDuplicateSymbol, detectDuplicateMints, canOnlyAddOneToken, validMintAddress, noEditsToPreviousLinesAllowed, isCommunityValidated, isSymbolConfusing, newTokensHaveMatchingOnchainMeta} from "./utils/validate";
import { ValidatedTokensData } from "./types/types";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { indexToLineNumber } from "./utils/validate";
import { parse } from "csv-parse/sync";
import fs from "fs";
import { allowedDuplicateSymbols, allowedNotCommunityValidated } from "./utils/duplicate-symbols";

export async function validateValidatedTokensCsv(filename: string): Promise<number> {
    const [records, recordsRaw] = parseCsv(filename);

    const recordsPreviousRaw = await gitPreviousVersion("validated-tokens.csv");
    fs.writeFileSync(".validated-tokens-0.csv", recordsPreviousRaw);
    const [recordsPrevious, _] = parseCsv(".validated-tokens-0.csv")
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    let duplicateSymbols = 0;
    let duplicateMints = 0;
    let attemptsToAddMultipleTokens = 0;
    let invalidMintAddresses = 0;
    let notCommunityValidated = 0;
    let noEditsAllowed = 0;
    let potentiallyConfusingSymbols = 0;
    let doubleCheckMetadataOnChain = 0;

    duplicateSymbols = detectDuplicateSymbol(recordsPrevious, records);
    duplicateMints = detectDuplicateMints(records);
    attemptsToAddMultipleTokens = canOnlyAddOneToken(recordsPrevious, records)
    invalidMintAddresses = validMintAddress(records);
    noEditsAllowed = noEditsToPreviousLinesAllowed(recordsPrevious, records);
    notCommunityValidated = isCommunityValidated(records);
    potentiallyConfusingSymbols = isSymbolConfusing(recordsPrevious, records);
    doubleCheckMetadataOnChain = await newTokensHaveMatchingOnchainMeta(connection, recordsPrevious, records);

    console.log("No More Duplicate Symbols:", duplicateSymbols, `(${allowedDuplicateSymbols.length} exceptions)`);
    console.log("Duplicate Mints:", duplicateMints);
    console.log("Attempts to Add Multiple Tokens:", attemptsToAddMultipleTokens);
    console.log("Invalid Mint Addresses:", invalidMintAddresses);
    console.log("Not Community Validated:", notCommunityValidated, `(${allowedNotCommunityValidated.length} exceptions)`);
    console.log("Edits to Existing Tokens:", noEditsAllowed);
    console.log("Issues with Symbols in Added Tokens:", potentiallyConfusingSymbols);
    console.log("Onchain Metadata Mismatches:", doubleCheckMetadataOnChain);
    return (duplicateSymbols + duplicateMints + attemptsToAddMultipleTokens + invalidMintAddresses + noEditsAllowed + doubleCheckMetadataOnChain)
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