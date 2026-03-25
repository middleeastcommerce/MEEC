# Trust Wallet Submission Package

This folder contains the files prepared for submitting `MEEC` to the Trust Wallet assets repository.

## Prepared asset path

Copy the contents below into the root of your fork of `trustwallet/assets`:

`blockchains/ethereum/assets/0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20/`

That folder contains:

- `logo.png`
- `info.json`

## Current asset details

- Name: `Middle East E-Commerce`
- Symbol: `MEEC`
- Network: `Ethereum`
- Type: `ERC20`
- Decimals: `18`
- Contract: `0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20`
- Website: `https://middleeastcommerce.net`
- Explorer: `https://etherscan.io/token/0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20`

## Before creating the PR

Trust Wallet's current public requirements say reviewers consider:

- live website and detailed white paper
- active social presence and support
- a completed security audit
- CoinMarketCap listing
- at least 10,000 holders and 15,000 transactions

The submission files are ready, but these review criteria still need to be satisfied and verified from public sources before approval is likely.

## Recommended submission flow

1. Fork `https://github.com/trustwallet/assets`
2. Create a branch such as `add-meec-ethereum`
3. Copy `trustwallet-submission/blockchains/ethereum/assets/0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20` into your fork at `blockchains/ethereum/assets/`
4. Commit and push
5. Open the pull request
6. Pay the current Trust Wallet processing fee shown by their bot

## Notes

- `logo.png` must stay lowercase and remain square.
- The current source image in this repo is `257x257`; Trust Wallet recommends `256x256`.
- I copied the existing image as-is. If you want, I can normalize it to exactly `256x256` before submission.
