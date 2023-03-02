import fetch from "node-fetch";
import { getValidated } from "../../get-validated";
import { getJupAll } from "./get-jup-all";
import { SolanaFmToken } from "../../types/types";
import {createArrayCsvWriter} from  'csv-writer';


export async function run() {
  const jupMints = await getJupAll();

  let startIndex = 0;
  let endIndex = 50;
  let QUERY_SIZE = 50;
  let solanaFmTokens: SolanaFmToken[][] = [];
  let verifiedCount = 0;
  try {
    while (endIndex <= jupMints.length) {
      let tokensToQuery = jupMints.slice(startIndex, endIndex);
      const response = await fetch(`https://api.solana.fm/v0/tokens`, {
        method: "POST",
        body: JSON.stringify({ tokenHashes: tokensToQuery }),
      });
      let tokens = (await response.json()).result;

      solanaFmTokens = solanaFmTokens.concat(
        tokens.map((tokenData: any) => {
          let token: SolanaFmToken = tokenData.data;
          if (token.verified) {
            verifiedCount++;
          }
          return [
            token.tokenName,
            token.symbol,
            token.mint,
            token.decimals,
            token.logo,
            token.verified,
          ];
        })
      );
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
  console.log(
    `Verified SolanaFM tokens: ${verifiedCount}`
  );
   
  // Write to file
  const csvWriter = createArrayCsvWriter({
    header: ["NAME", "SYMBOL", "MINT", "DECIMALS", "LOGOURI", "VERIFIED"],
    path: './src/partners/data/solana-fm.csv'  
  });

 
  csvWriter.writeRecords(solanaFmTokens)       // returns a promise
    .then(() => {
        console.log('Done writing to file');
    });
}

run();
