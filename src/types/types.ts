type PatchObj = {
  /**
   * File where this patch occurs
   */
  file: string;

  /**
   * Starting line number of patch
   */
  start: number;

  /**
   * Ending line number of patch
   */
  end: number;

  /**
   * The patch contents
   */
  lines: string[];
};

export type Patch = {
  removed: PatchObj;
  added: PatchObj;
};

export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export interface SolanaFmToken extends Token {
  verified: boolean;
  // tags: string[];
}

export interface SolanaFmResult {
  tokenHash: string;
  data: SolanaFmData;
}

export interface SolanaFmData {
  mint: string;
  tokenName: string;
  symbol: string;
  decimals: number;
  description: string;
  logo: string;
  tags: string[];
  verified: boolean;
  network: string[];
  metadataToken: string;
}

export type ValidatedSet = {
  mints: Set<string>;
  names: Set<string>;
  symbols: Set<string>;
  logoURL: Set<string>;
};

export enum ValidationError {
  UNRELATED_FILE = "Changes made to unrelated files",
  UNRELATED_CODE = "Changes to unrelated code are not allowed",
  MULTIPLE_TOKENS = "Only one token can be added at a time",
  DUPLICATE_NAME = "Token name already exists",
  DUPLICATE_SYMBOL = "Token symbol already exists, please forbid even more duplicates",
  DUPLICATE_MINT = "Mint already exists",
  INVALID_MINT = "Invalid mint address, not base58 decodable",
  INVALID_DECIMALS = "Invalid decimals",
  INVALID_IMAGE_URL = "Invalid image URL",
  INVALID_METADATA = "Metadata does not match on-chain data",
  INVALID_COMMUNITY_VALIDATED = "Invalid community validated",
  CHANGES_DISCOURAGED = "Tokens already in the CSV should not be edited"
}

export interface WormholeData {
  dest: string;
  symbol: string;
  name: string;
  address: string;
  decimals: string;
  origin: string;
  sourceAddress: string;
  sourceDecimals: string;
  coingeckoId: string;
  logo: string;
  serumV3Usdc: string;
  serumV3Usdt: string;
}

export interface ValidatedTokensData {
  Name: string;
  Symbol: string;
  Mint: string;
  Decimals: string;
  LogoURI: string;
  "Community Validated": boolean;
  Line: number;
}

export interface AllowedException {
  Name: string;
  Symbol: string;
  Mint: string;
  "Community Validated": boolean;
}