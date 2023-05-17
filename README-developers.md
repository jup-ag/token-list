# Dev Guide to the Token List API 
Hello curious one -- you found the tech README! 🥷
The [Token List API](https://station.jup.ag/docs/apis/token-list/token-list-api) consists of the "Strict" list and "All" list. The Strict list is currently made up of tokens from the original solana token list registry, community validated tokens, and wormhole tokens. We also add metadata tags on all tokens from partner APIs.

Everything that feeds the API can be found in this repo, so you know exactly how it's made and what token data is entering the API.

## Key files
```bash
banned-tokens.csv
validated-tokens.csv 
src
   |-- partners
   |   |-- data
   |   |-- scripts
   |-- main.ts
```

## Tokens and Metadata Tags:
- `validated-tokens.csv`: Consists original Solana token registry and community validated tokens. Jupiter's API crawls this list, and updates to this file via community PRs will be reflected in the API response.
- `src/partners/data/wormhole.csv`: Wormhole tokens. An update is crawled via `src/partners/scripts/get-wormhole/ts` every week, and any changes will be made via a PR to this repo.
- `src/partners/data/solana-fm.csv`: We add metadata of tokens from solana fm that are "verified:true". An update is crawled via `src/partners/scripts/get-solana-fm/ts` every week, and any changes will be made via a PR to this repo.

## API outcome:
- Our 'All' token list API picks up all of the above tokens and tags
- Our 'Strict' list filters for tokens from the 'All' list with [these tags](https://station.jup.ag/docs/apis/token-list/token-list-api): "wormhole", "original-registry", and "community".
