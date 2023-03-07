import fetch from "node-fetch";
import { getJupAll } from "./get-jup-all";
import { SolanaFmToken, SolanaFmResult, SolanaFmData } from "../../types/types";
import { createObjectCsvWriter } from "csv-writer";

export async function run() {
  const jupMints = await getJupAll();

  let startIndex = 0;
  let endIndex = 50;
  let QUERY_SIZE = 50;
  let solanaFmTokens: SolanaFmToken[] = [];
  let verifiedCount = 0;
  try {
    while (endIndex <= jupMints.length) {
      let tokensToQuery = jupMints.slice(startIndex, endIndex);
      const response = await fetch(`https://api.solana.fm/v0/tokens`, {
        method: "POST",
        body: JSON.stringify({ tokenHashes: tokensToQuery }),
      });
      let results: SolanaFmResult[] = (await response.json()).result;

      const tokens: SolanaFmToken[] = results.map(
        (fmResult: SolanaFmResult) => {
          const data: SolanaFmData = fmResult.data;
          if (data.verified) {
            verifiedCount++;
          }
          return {
            name: data.tokenName,
            symbol: data.symbol,
            address: data.mint,
            decimals: data.decimals,
            logoURI: data.logo,
            // tags: data.tags,
            verified: data.verified,
          };
        }
      );
      solanaFmTokens = solanaFmTokens.concat(tokens);
      startIndex += QUERY_SIZE;
      endIndex += QUERY_SIZE;
    }
  } catch (error: any) {
    console.log(error);
    throw new Error("Failed to fetch validated tokens");
  }

  console.log(
    `Completed fetching Solana.fm tokens: ${solanaFmTokens.length} tokens found against ${jupMints.length} Jup 'All' tokens`
  );
  console.log(`Verified SolanaFM tokens: ${verifiedCount}`);

  // Write to file
  const csvWriter = createObjectCsvWriter({
    header: [
      { id: "name", title: "NAME" },
      { id: "symbol", title: "SYMBOL" },
      { id: "address", title: "ADDRESS" },
      { id: "decimals", title: "DECIMALS" },
      { id: "logoURI", title: "LOGOURI" },
      { id: "verified", title: "VERIFIED" },
      // { id: "tags", title: "TAGS" },
    ],
    path: "./src/partners/data/solana-fm.csv",
  });

  csvWriter.writeRecords(solanaFmTokens).then(() => {
    console.log("Done writing to file");
  });
}

run();
