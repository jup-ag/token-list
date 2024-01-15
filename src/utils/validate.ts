import { Patch, Record, ValidatedSet, ValidationError } from "../types/types";
import { PublicKey } from "@solana/web3.js";

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
  if(!PublicKey.isOnCurve(new PublicKey(mint))) {
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

export function detectDuplicateSymbol(tokens: Record[]): Record[] {
  const map = new Map();
  tokens.forEach((token) => {
    if (map.has(token.Symbol)) {
      console.log(ValidationError.DUPLICATE_SYMBOL)
      console.log("Existing", map.get(token.Symbol), "Duplicate", token);
    } else {
      map.set(token.Symbol, token);
    }
  });
  console.log("# of records in CSV:", tokens.length, "after duplicate filtering:", map.size);
  return Array.from(map.values());
}

export function canOnlyAddOneToken(prevTokens: Record[], tokens: Record[]): boolean {
  const diffLength = tokens.length - prevTokens.length;

  if (diffLength > 1) {
    console.log(ValidationError.MULTIPLE_TOKENS);
    const offendingTokens: Record[] = [];
    for (let i = prevTokens.length; i < tokens.length; i++) {
      offendingTokens.push(tokens[i]);
    }
    console.log('Offending Tokens: ', offendingTokens);
    return false;
  }
  return true;
}