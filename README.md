# ERC-20 Token

A minimal, immutable ERC-20 token designed to pass token security scanners
(Token Sniffer, DexScreener, GoPlus, Honeypot.is) with a green / safe rating.

**No owner. No mint. No pause. No fees. No backdoors.**

---

## Features

| Feature | Included | Notes |
|---|---|---|
| Standard ERC-20 | Yes | transfer, approve, allowance, balanceOf |
| Burnable | Yes | Holders can burn their own tokens |
| EIP-2612 Permit | Yes | Gasless approvals via off-chain signature |
| Ownable / admin | No | Zero owner control after deployment |
| Mint after deploy | No | Supply fixed at construction |
| Pause | No | Transfers can never be frozen |
| Blacklist | No | No address can be blocked from selling |
| Fees on transfer | No | Standard ERC-20 — no hidden costs |

---

## Project Structure

```
contracts/
  MyToken.sol          Main ERC-20 contract
scripts/
  deploy.js            Deploy + auto-verify on Etherscan
  verify.js            Standalone Etherscan verification
test/
  MyToken.test.js      Full test suite (Hardhat + ethers.js)
hardhat.config.js      Network and plugin configuration
requirements.md        Formal requirements spec with rationale
.env.example           Environment variable template
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your values
cp .env.example .env
```

Edit `.env`:
```
PRIVATE_KEY=your_deployer_private_key
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ALCHEMY_MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
INITIAL_SUPPLY=1000000000000000000000000
```

> INITIAL_SUPPLY is in wei. The example above is 1,000,000 tokens (18 decimals).
> To set 500,000 tokens: `500000000000000000000000`

---

## Commands

```bash
# Compile contracts
npm run compile

# Run all tests
npm test

# Run tests with gas report
REPORT_GAS=true npm test

# Run test coverage
npm run coverage

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to mainnet
npm run deploy:mainnet

# Verify an already-deployed contract on Sepolia
CONTRACT_ADDRESS=0x... npm run verify:sepolia

# Verify an already-deployed contract on mainnet
CONTRACT_ADDRESS=0x... npm run verify:mainnet
```

---

## Deployment

The deploy script automatically:
1. Deploys `MyToken` with the configured supply to your deployer address
2. Waits for 5 block confirmations
3. Verifies the source code on Etherscan

---

## Post-Deployment Checklist (for green badge)

After deploying and verifying:

- [ ] Confirm source is verified on Etherscan
- [ ] Add liquidity on Uniswap v3
- [ ] Lock LP tokens via [Unicrypt](https://app.unicrypt.network) or [Team Finance](https://www.team.finance)
- [ ] Check [Token Sniffer](https://tokensniffer.com) — submit your contract address
- [ ] Check [Honeypot.is](https://honeypot.is) — confirm no honeypot detection
- [ ] Check [GoPlus Security](https://gopluslabs.io) — review full security report
- [ ] Check DexScreener — confirm green safety badge

---

## Security

- No admin keys
- No proxy pattern
- Supply is fixed at deployment
- OpenZeppelin v5 contracts (audited)
- Solidity 0.8.20 (built-in overflow protection)

---

## Tech Stack

- Solidity ^0.8.20
- Hardhat 2.x
- OpenZeppelin Contracts v5
- ethers.js v6
