# Warning: This repo is now archived. Please read [this.](https://github.com/jup-ag/token-list/blob/main/README.md)

## Token list
A key part of our JUP Promise (Best Price, Best Token Selection, Best UX) is the idea that users should be able to trade any token they want on Jupiter, while having the peace of mind that the token they are trading is the right one.

To create a safer and more transparent trading experience while maintaining open access, we designed token lists with "Strict" and "All" options. The validated token list here is built up together with partners and community, feed Jupiter's "Strict" API, and is in use by ecosystem partners. 

Our design principles are: Safety, Openness, Unopinionated, Collaborative, Community-Driven. 

Learn more:
-  [Tweet](https://twitter.com/JupiterExchange/status/1625877026866446337?s=20)
-  [Blog post](https://station.jup.ag/blog/jupiter-token-list-api)
-  [API docs](https://station.jup.ag/docs/token-list/token-list-api)
-  [Getting on the Strict list docs](https://station.jup.ag/docs/get-your-token-onto-jup#getting-on-the-strict-list)

## Address Validation into 'Strict' List:
`If I'm trying to trade this token from this project, am I looking at the right one?`

The true identity of a token is its mint address. Scammers often try to impersonate a token by imitating metadata such as its name and logo. 

To help users stay safe from fake tokens, we provide a 'Strict' list with a trusted set of addresses and metadata from the original project team.

## Community Discussion and Prioritization 
We encourage discussion when new projects are trying to validate into the list. This gives new projects more visibility and the community a chance to get to know them. PRs are prioritized by the community -- the more you can show them that you are legit, the faster your PR would be approved. 

This could include:
 - Support from known accounts on your attestation tweet: [Example](https://twitter.com/Cogent_Crypto/status/1630963084037869569?s=20) 
- Attestation from known developers on your validation PR: [Example1](https://github.com/jup-ag/token-list/pull/165), [Example2](https://github.com/jup-ag/token-list/pull/76)
-  Support from your community in Jupiter's [#community-validation discord channel](https://discord.gg/jup)

  Reminder: Tokens that meet [minimum liquidity criteria](https://station.jup.ag/docs/get-your-token-onto-jup) will always be available for trading on the 'All' list even without immediate validation.

## Projects -- Open a PR to Request Validation:
- Open a PR like this [sample PR](https://github.com/jup-ag/token-list/pull/76) with your addition in the validated-tokens file.
- Fill up [the markdown template](https://github.com/jup-ag/token-list/blob/main/pull_request_template.md) in your PR description. It will be populated automatically in the draft description when you open the PR.
- ***To allow time for community discovery and discussion, reviews are generally done on a weekly basis. Your PR will not be reviewed until there is some community support. Once there is, it will be reviewed within a week. ALL PRS WITHOUT YOUR TOKEN NAME IN THE TITLE, which just says "Main", WILL BE CLOSED.***

## Community -- Support projects: 
- Support the projects you want to see on the list by supporting their tweets and helping to review their PR.
- To validate, leave a comment on the PR like those in [this example](https://github.com/jup-ag/token-list/pull/76). The approval process is held jointly by the team and moderators right now, but attestation from known accounts will show support and speed up the process. Over time, we would like to open it up to community members in a council.

## Developers -- Contribute to this Repo: 
- Feel free to contribute by opening a PR! We would like this to be community owned over time. Check out the "Issues" tab for some ideas on how to contribute!
- A technical walkthrough of how the inputs feed the Token List API can be found in `README-developers.md`
- Ideas? Feedback? Comment or talk to us in [Discord](https://discord.gg/jup). ❤️


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
