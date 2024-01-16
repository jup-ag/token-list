import { Patch, Record, ValidatedSet, ValidationError } from "../types/types";
import { PublicKey } from "@solana/web3.js";

function indexToLineNumber(index: number): number {
  return index + 2;
}
// Validates PR changes to the validated tokens csv file.
// Checks duplicates to JUP strict list and invalid inputs.
export function validateGitPatch(patch: Patch, validatedSet: ValidatedSet): ValidationError[] {
  // console.log("Processing patch", patch);
  const errors: ValidationError[] = [];

  // TODO: Flag changes to unrelated files
  // ...

  // Flag removals
  if (patch.removed.lines.length > 0) {
    errors.push(ValidationError.UNRELATED_CODE);
  }

  // Flag multiple line additions
  if (patch.added.lines.length > 1) {
    errors.push(ValidationError.MULTIPLE_TOKENS);
  }

  const [tokenName, symbol, mint, decimals, imageURL, isCommunity] =
    patch.added.lines[0].split(",");

  // Flag duplicates
  if (validatedSet.names.has(tokenName)) {
    errors.push(ValidationError.DUPLICATE_NAME);
  }

  if (validatedSet.symbols.has(symbol)) {
    errors.push(ValidationError.DUPLICATE_SYMBOL);
  }

  if (validatedSet.mints.has(mint)) {
    errors.push(ValidationError.DUPLICATE_MINT);
  }

  // Flag invalid mint address
  if (!PublicKey.isOnCurve(new PublicKey(mint))) {
    errors.push(ValidationError.INVALID_MINT);
  }

  if (isNaN(Number(decimals)) || Number(decimals) < 0 || Number(decimals) > 9) {
    errors.push(ValidationError.INVALID_DECIMALS);
  }

  if (isCommunity !== "true") {
    errors.push(ValidationError.INVALID_COMMUNITY_VALIDATED);
  }

  // TODO: match with onchain data
  // ....
  // ...

  // console.log("Patch Errors", errors);
  return errors;
}

export function detectDuplicates(tokens: Record[]): number {
  let errorCount = 0;
  const map = new Map();
  tokens.forEach((token, i) => {
    if (map.has(token.Mint)) {
      console.log(ValidationError.DUPLICATE_MINT)
      console.log("Existing", map.get(token.Mint), "Duplicate", `(line ${indexToLineNumber(i)})`, token);
      errorCount++;
    } else {
      map.set(token.Mint, token);
    }
  });
  return errorCount;
}

export function detectDuplicateSymbol(tokens: Record[]): number {
  const map = new Map();
  let errorCount = 0;
  tokens.forEach((token, i) => {
    if (map.has(token.Symbol)) {
      console.log(ValidationError.DUPLICATE_SYMBOL)
      console.log("Existing", map.get(token.Symbol), "Duplicate", `(line ${indexToLineNumber(i)})`, token);
      errorCount++;
    } else {
      map.set(token.Symbol, token);
    }
  });
  return errorCount;
}

export function canOnlyAddOneToken(prevTokens: Record[], tokens: Record[]): number {
  let errorCount = 0;
  const diffLength = tokens.length - prevTokens.length;

  if (diffLength > 1) {
    console.log(ValidationError.MULTIPLE_TOKENS);
    const offendingTokens: Record[] = [];
    for (let i = prevTokens.length; i < tokens.length; i++) {
      offendingTokens.push(tokens[i]);
    }
    console.log('Offending Tokens: ', offendingTokens);
    errorCount++;
  }
  return errorCount;
}

export function validMintAddress(tokens: Record[]): number {
  let errorCount = 0;

  tokens.forEach((token, i) => {
    // console.log(i, token)
    try {
      // new PublicKey() can throw an error if the mint address is really invalid
      const pk = new PublicKey(token.Mint)
      // const isOnCurve = PublicKey.isOnCurve(pk)
      // if (!isOnCurve) {
      //   console.log(ValidationError.INVALID_MINT, `(line ${indexToLineNumber(i)})`, token);
      //   errorCount++;
      // }
    } catch (error) {
      console.log(ValidationError.INVALID_MINT, `(line ${indexToLineNumber(i)})`, token, error);
      errorCount++;
    }
  });
  return errorCount;
}

export function validDecimals(tokens: Record[]): number {
  let errorCount = 0;
  tokens.forEach((token) => {
    if (isNaN(Number(token.Decimals)) || Number(token.Decimals) < 0 || Number(token.Decimals) > 9) {
      console.log(ValidationError.INVALID_DECIMALS, token);
      errorCount++;
    }
  });
  return errorCount;
}

export function validCommunityValidated(tokens: Record[]): number {
  let errorCount = 0;
  tokens.forEach((token, i) => {
    if (token["Community Validated"] !== "true") {
      console.log(ValidationError.INVALID_COMMUNITY_VALIDATED, `(line ${indexToLineNumber(i)})`, token);
      errorCount++;
    }
  });
  return errorCount;
}

export function areRecordsEqual(r1: Record, r2: Record): boolean {
  return (
    r1.Name === r2.Name &&
    r1.Symbol === r2.Symbol &&
    r1.Mint === r2.Mint &&
    r1.Decimals === r2.Decimals &&
    r1.LogoURI === r2.LogoURI &&
    r1["Community Validated"] === r2["Community Validated"]
  );
}