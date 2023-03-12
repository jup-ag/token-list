import { Token, ValidatedSet } from "../types/types";
import fetch from "node-fetch";

// Read existing JUP validated tokens into Set
export async function getValidated(): Promise<ValidatedSet> {
  const names = new Set<string>();
  const symbols = new Set<string>();
  const mints = new Set<string>();
  const logoURL = new Set<string>();

  try {
    const data = await fetch(`https://token.jup.ag/strict`)
    const tokens = await data.json()
    tokens.forEach((token: Token) => {
      names.add(token.name);
      symbols.add(token.symbol);
      mints.add(token.address);
      logoURL.add(token.logoURI)
    });
    return { names, symbols, mints, logoURL };
  } catch (error: any) {
    throw new Error("Failed to fetch validated tokens");
  }
}
