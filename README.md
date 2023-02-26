# Jupiter's Community Validated Token List (BETA)

A key part of our JUP Promise (Best Price, Best Token Selection, Best UX) is the idea that users should be able to trade any token they want on Jupiter, while having the peace of mind that the token they are trading is the right one.

To create a safer and more transparent trading experience while maintaining open access, we designed token lists with "Strict" and "All" options. The validated token list here is built up together with partners and community, feed Jupiter's "Strict" API, and is in use by ecosystem partners. 

Our design principles are: Safety, Openness, Unopinionated, Collaborative, Community-Driven. 

Learn more:
-  [Tweet](https://twitter.com/JupiterExchange/status/1625877026866446337?s=20)
-  [Blog post](https://blog.jup.ag/token-list-api/)
-  [API docs](https://docs.jup.ag/api/token-list-api)

## Community-Driven Validation into 'Strict' List:
 The 'Strict' list approach helps to keep our community safe from fake tokens while allowing open access to all projects in the 'All' list. **They are the tokens that our community wants to trade safely. As such, your token has to be known and receive support from the community-- there is no guarantee that it will be validated into the strict list.**

  Reminder: Tokens that meet minimum liquidity criteria will always be available for trading on the 'All' list even without immediate validation.
## Open a PR to Request Validation:
- Open a PR like this [sample PR](https://github.com/jup-ag/token-list/pull/24) with your addition in the validated-tokens file.
- Fill up [the markdown template](https://github.com/jup-ag/token-list/blob/main/pull_request_template.md) in your PR description. It will be populated automatically in the draft description when you open the PR. Your PR should point to `staging`.
- Please get your community to support your attestation tweet on Twitter (likes, retweets, comments) and show us what you're about. You can also 
share about your project in our [token-validation discord channel](https://discord.gg/SJmyW8TG).
- The PRs will not be reviewed by our community until your project is known and supported. See [Community Driven Validation](#community-driven-validation-into-strict-list)

## Community Support: 
- Support the projects you want to see on the list by supporting their tweets and helping to review their PR.
- To validate, leave a comment on the PR like [this example](https://github.com/jup-ag/token-list/pull/24#pullrequestreview-1294727250). The approval process is held jointly by the team and moderators right now, but your contribution will show support and speed up the process. Over time, we would like to open it up to community members in a council.

## Mechanics (Early, Work in Progress):
- After community validation and approval, PRs will be merged to `staging` branch. 
- Tokens will be live when the PRs are merged to `main`. 
- There is no timeline on this right now, and we prefer to be cautious while the process is still early and we're iterating. We ask for your patience as we work on this together.


<hr>

## Validated Tokens List

### Example Fields:  
- `Name`: Genopets Ki
- `Symbol`: KI 
- `Mint Address`: kiGenopAScF8VF31Zbtx2Hg8qA5ArGqvnVtXb83sotc
- `Decimals`: 9 
- `LogoURI`: https://arweave.net/WfPR8w5dEoerG_bI3S2o2_nuSfWY3p8M4YbQ6ijd1cQ?ext=png
- `Community Validated`: true

<hr>

## Banned Tokens List
Tokens here will not show up on the Jupiter UI, SDK and API.

To propose a ban, please open a PR with the reason and related links in the description.


<hr>
