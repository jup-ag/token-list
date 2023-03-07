import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import path from "path";
import { ValidatedTokensData, WormholeData } from "../../types/types";

export const checkWormholeWithVerified = () => {
  const wormholeTokens: WormholeData[] = parse(
    readFileSync(path.join(__dirname, "../../../src/partners/data/wormhole.csv")),
    {
      columns: true,
    }
  );

  const verifiedData: ValidatedTokensData[] = parse(
    readFileSync(path.join(__dirname, "../../../validated-tokens.csv")),
    {
      columns: true,
    }
  );

  const mintToWormholeData = new Map<string, WormholeData>();

  wormholeTokens.forEach((wormholeToken) => {
    mintToWormholeData.set(wormholeToken.address, wormholeToken);
  });

  verifiedData.forEach((verifiedToken) => {
    if (mintToWormholeData.has(verifiedToken.Mint)) {
      const wormholeData = mintToWormholeData.get(verifiedToken.Mint)!;
      if (Number(verifiedToken.Decimals) !== Number(wormholeData.decimals)) {
        console.log(`Decimals mismatch for ${verifiedToken.Mint}`);
      }
      if (verifiedToken.Symbol !== wormholeData.symbol) {
        console.log(
          `Symbol mismatch for ${verifiedToken.Mint}, before: ${verifiedToken.Symbol}, after: ${wormholeData.symbol}`
        );
      }
      if (verifiedToken.Name !== wormholeData.name) {
        console.log(
          `Name mismatch for ${verifiedToken.Mint}, before: ${verifiedToken.Name}, after: ${wormholeData.name}`
        );
      }
      if (verifiedToken.LogoURI !== wormholeData.logo) {
        console.log(
          `LogoURI mismatch for ${verifiedToken.Mint}, before: ${verifiedToken.LogoURI}, after: ${wormholeData.logo}`
        );
      }
    }
  });
};

checkWormholeWithVerified();
