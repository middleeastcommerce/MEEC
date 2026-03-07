# MEEC Token — Deployment Guide

> Complete step-by-step guide to deploying the Middle East E-Commerce (MEEC) token
> to Ethereum Sepolia testnet and Ethereum mainnet.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Environment Configuration](#3-environment-configuration)
4. [Pre-Deployment Checklist](#4-pre-deployment-checklist)
5. [Deploy to Sepolia Testnet](#5-deploy-to-sepolia-testnet)
6. [Verify on Sepolia](#6-verify-on-sepolia)
7. [Testnet Validation Checks](#7-testnet-validation-checks)
8. [Deploy to Ethereum Mainnet](#8-deploy-to-ethereum-mainnet)
9. [Verify on Mainnet Etherscan](#9-verify-on-mainnet-etherscan)
10. [Post-Deployment Actions](#10-post-deployment-actions)
11. [Token Distribution to Old Users](#11-token-distribution-to-old-users)
12. [Adding Liquidity on Uniswap](#12-adding-liquidity-on-uniswap)
13. [Locking LP Tokens](#13-locking-lp-tokens)
14. [Security Scanner Submission](#14-security-scanner-submission)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Prerequisites

Before starting, you need the following accounts and tools installed:

### Software Required

| Tool | Version | Install |
|---|---|---|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v9 or higher | Comes with Node.js |
| Git | Any | https://git-scm.com |

Check your versions:
```bash
node --version    # should be v18+
npm --version     # should be v9+
```

### Accounts Required

| Service | What You Need | URL |
|---|---|---|
| **Alchemy** | Free account → create an app → get API key | https://alchemy.com |
| **Etherscan** | Free account → API Keys section → create key | https://etherscan.io |
| **Deployer Wallet** | A wallet with ETH for gas (MetaMask, hardware wallet, etc.) | — |

### ETH Required for Gas

| Network | Estimated Cost | Where to Get |
|---|---|---|
| **Sepolia testnet** | ~0.01 ETH (free testnet ETH) | https://sepoliafaucet.com |
| **Ethereum mainnet** | ~0.005–0.02 ETH (depends on gas price) | Buy ETH on any exchange |

> **Security tip:** Use a dedicated deployer wallet — not your main personal wallet. Transfer only the ETH needed for deployment gas. After deployment, the 100B MEEC tokens will arrive in this wallet.

---

## 2. Project Setup

```bash
# Clone or navigate to the project directory
cd /home/ibrahim/Desktop/MEEC

# Install all dependencies
npm install

# Verify everything compiles cleanly
npm run compile

# Run the full test suite — all 24 tests must pass before deploying
npm test
```

Expected output from `npm test`:
```
  MEECToken
    Deployment
      ✔ has the correct name
      ✔ has the correct symbol
      ✔ has 18 decimals
      ✔ mints the entire supply to the recipient
      ✔ has zero balance for other accounts
    Transfers
      ✔ transfers tokens between accounts
      ... (19 more passing)

  24 passing
```

If any test fails, **do not deploy**. Fix the issue first.

---

## 3. Environment Configuration

### Step 1 — Create your .env file

```bash
cp .env.example .env
```

### Step 2 — Fill in the .env file

Open `.env` in a text editor and fill in all four values:

```env
# Your deployer wallet private key (WITHOUT the 0x prefix)
# Example: abc123def456...  (64 hex characters)
PRIVATE_KEY=your_64_character_private_key_here

# Alchemy RPC URL for Sepolia
# Get from: Alchemy Dashboard → Your App → API Key → Endpoints → Ethereum Sepolia
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Alchemy RPC URL for Mainnet
# Get from: Alchemy Dashboard → Your App → API Key → Endpoints → Ethereum Mainnet
ALCHEMY_MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Etherscan API key for source verification
# Get from: Etherscan → Sign In → My Profile → API Keys → Add
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Enable gas cost reporting (optional, set to true to see USD cost estimates)
REPORT_GAS=false
```

### Step 3 — Verify the .env is loaded correctly

```bash
node -e "require('dotenv').config(); console.log('PRIVATE_KEY set:', !!process.env.PRIVATE_KEY)"
# Should print: PRIVATE_KEY set: true
```

> **Critical security rules:**
> - Never commit `.env` to git — it is already in `.gitignore`
> - Never share your private key with anyone
> - Never paste your private key into any website or terminal that others can see
> - Use `0x` prefix ONLY if your wallet tool requires it — the scripts handle both formats

---

## 4. Pre-Deployment Checklist

Run through this checklist before every deployment (testnet AND mainnet):

```
□ npm test — all 24 tests pass with zero failures
□ .env file exists and all 4 variables are filled in
□ PRIVATE_KEY is the correct deployer wallet (double-check the address)
□ Deployer wallet has enough ETH for gas
□ ALCHEMY_SEPOLIA_URL is a working Sepolia endpoint (for testnet)
□ ALCHEMY_MAINNET_URL is a working mainnet endpoint (for mainnet)
□ ETHERSCAN_API_KEY is valid (test: visit https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=YOUR_KEY)
□ You know the recipient address for the 100B tokens (defaults to deployer address)
```

---

## 5. Deploy to Sepolia Testnet

Always deploy to Sepolia first. This costs nothing (testnet ETH) and lets you validate the full deployment before spending real money on mainnet.

### Get Sepolia ETH

Visit https://sepoliafaucet.com and request testnet ETH to your deployer wallet address.

### Run the deploy script

```bash
npm run deploy:sepolia
```

### Expected output

```
Deploying with account: 0xYourDeployerAddress
Account balance: 0.5 ETH
Deploying MEECToken — recipient: 0xYourDeployerAddress | supply: 100,000,000,000 MEEC (hardcoded in contract)
MEECToken deployed to: 0xContractAddress
Waiting for 5 block confirmations...
Verifying on Etherscan...
Verification successful.

Deployment summary:
  Network  : sepolia
  Address  : 0xContractAddress
  Recipient: 0xYourDeployerAddress
  Supply   : 100,000,000,000 MEEC (hardcoded in contract)
```

**Save the contract address** — you will need it for all subsequent steps.

### If verification fails automatically

The deploy script attempts auto-verification after 5 block confirmations. If it fails (network timing issue), run verification manually:

```bash
CONTRACT_ADDRESS=0xYourContractAddress npm run verify:sepolia
```

---

## 6. Verify on Sepolia

Verification publishes the source code on Etherscan so anyone can read and audit it. The deploy script does this automatically. To check:

1. Go to: `https://sepolia.etherscan.io/address/0xYourContractAddress`
2. Click the **Contract** tab
3. You should see a green checkmark ✅ and the full Solidity source code

If you see "ByteCode Only" instead of source code, run:
```bash
CONTRACT_ADDRESS=0xYourContractAddress npm run verify:sepolia
```

---

## 7. Testnet Validation Checks

After deploying to Sepolia, validate the contract behaves correctly before going to mainnet.

### Check on Etherscan (Sepolia)

Go to `https://sepolia.etherscan.io/address/0xYourContractAddress`

Confirm all of these:

| Check | Expected Value |
|---|---|
| Contract name | `MEECToken` |
| Token name (Read Contract → `name`) | `Middle East E-Commerce` |
| Token symbol (Read Contract → `symbol`) | `MEEC` |
| Decimals (Read Contract → `decimals`) | `18` |
| Total supply (Read Contract → `totalSupply`) | `100000000000000000000000000000` |
| TOTAL_SUPPLY constant (Read Contract → `TOTAL_SUPPLY`) | `100000000000000000000000000000` |
| Deployer balance (Read Contract → `balanceOf` → enter deployer address) | `100000000000000000000000000000` |
| Source code verified | Green ✅ checkmark on Contract tab |

### Check on Honeypot.is (Sepolia)

1. Go to https://honeypot.is
2. Select **Ethereum Sepolia** network
3. Enter your contract address
4. Expected result: **"Is not a Honeypot"** — buy and sell simulations both succeed with 0% fee

### Check on Token Sniffer

1. Go to https://tokensniffer.com
2. Enter your Sepolia contract address
3. Review the score — should be 85+ with no critical flags

### Send a test transfer

Import the token to MetaMask using the contract address. Send a small test transfer between two wallets and confirm:
- Recipient receives exactly the amount sent (no fee deducted)
- Transaction succeeds without errors
- Balance updates correctly on Etherscan

**Only proceed to mainnet if all checks above pass.**

---

## 8. Deploy to Ethereum Mainnet

Once Sepolia is fully validated:

```bash
npm run deploy:mainnet
```

### Expected output

```
Deploying with account: 0xYourDeployerAddress
Account balance: 0.05 ETH
Deploying MEECToken — recipient: 0xYourDeployerAddress | supply: 100,000,000,000 MEEC (hardcoded in contract)
MEECToken deployed to: 0xMainnetContractAddress
Waiting for 5 block confirmations...
Verifying on Etherscan...
Verification successful.

Deployment summary:
  Network  : mainnet
  Address  : 0xMainnetContractAddress
  Recipient: 0xYourDeployerAddress
  Supply   : 100,000,000,000 MEEC (hardcoded in contract)
```

**Save the mainnet contract address immediately.** Write it down in at least two places.

---

## 9. Verify on Mainnet Etherscan

The deploy script auto-verifies. Confirm at:

`https://etherscan.io/address/0xMainnetContractAddress`

Same checklist as Sepolia — verify all values under Read Contract:

| Field | Expected |
|---|---|
| `name()` | `Middle East E-Commerce` |
| `symbol()` | `MEEC` |
| `decimals()` | `18` |
| `totalSupply()` | `100000000000000000000000000000` |
| `TOTAL_SUPPLY` | `100000000000000000000000000000` |
| `balanceOf(your address)` | `100000000000000000000000000000` |

If auto-verification failed:
```bash
CONTRACT_ADDRESS=0xMainnetContractAddress npm run verify:mainnet
```

---

## 10. Post-Deployment Actions

Complete these immediately after deployment:

### Add token to MetaMask

1. Open MetaMask
2. Switch to Ethereum mainnet
3. Click "Import tokens"
4. Enter contract address
5. Token name and symbol auto-fill — confirm they show `MEEC` / `Middle East E-Commerce`
6. Confirm you see `100,000,000,000 MEEC` in your wallet

### Update the audit report

Open `MEEC_Audit_Report.md` and note the mainnet contract address for your records.

### Announce the contract address

Publish the verified Etherscan link on all official channels:
- Website
- Twitter/X
- Telegram
- Any other official community channels

This gives users a trusted source to find the correct contract address and prevents scam tokens using the MEEC name.

---

## 11. Token Distribution to Old Users

After deployment, 100,000,000,000 MEEC sit in the deployer wallet. To send tokens to old users from the previous broken token:

### Method 1 — Manual transfer via MetaMask

For small lists (under 20 addresses):

1. Import MEEC token to MetaMask using the contract address
2. For each old user address:
   - Click Send
   - Enter the old user's address
   - Enter the amount of MEEC to send
   - Confirm the transaction
3. Each transfer costs a small gas fee (~$0.50–$5 depending on network congestion)

### Method 2 — Bulk transfer via Etherscan (Write Contract)

1. Go to your contract on Etherscan
2. Click **Contract → Write Contract**
3. Connect your MetaMask wallet (must be the deployer/holder wallet)
4. Find the `transfer` function
5. Fill in:
   - `to`: recipient address
   - `amount`: amount in wei (multiply MEEC amount by 10^18)
     - Example: 1,000 MEEC = `1000000000000000000000`
     - Example: 1,000,000 MEEC = `1000000000000000000000000`
6. Click Write → confirm in MetaMask

### Method 3 — Bulk airdrop via a disperse tool

For large lists (hundreds of addresses), use a bulk transfer tool:

1. Go to https://disperse.app (works with any ERC-20)
2. Connect your MetaMask wallet
3. Enter the MEEC contract address
4. Upload or paste your list of addresses and amounts
5. Approve disperse.app to spend MEEC (one-time approval transaction)
6. Execute the bulk transfer in one transaction

> **Important:** Double-check every recipient address before sending. ERC-20 transfers are irreversible. A typo sends tokens to an address nobody controls.

### Tracking distributions

Keep a spreadsheet with:
- Old user wallet address
- Amount sent (MEEC)
- Transaction hash (from Etherscan)
- Date sent

---

## 12. Adding Liquidity on Uniswap

Adding liquidity creates a trading pair that lets anyone swap ETH ↔ MEEC or USDT ↔ MEEC on Uniswap v3. This is what makes the token tradeable on the open market.

### Step 1 — Go to Uniswap v3

https://app.uniswap.org/pool

### Step 2 — Create a new position

1. Click **New Position**
2. Select the pair:
   - Token A: **ETH** (or USDC/USDT if you want a stablecoin pair)
   - Token B: **MEEC** — paste your contract address: `0xYourMainnetContractAddress`
3. Select fee tier: **1%** (recommended for new/volatile tokens) or **0.3%** (for stable pairs)

### Step 3 — Set the price range

For a new token with no existing market price:
- Set **Min Price** to a very low number (e.g., `0.000001` ETH per MEEC)
- Set **Max Price** to a high number (e.g., `0.01` ETH per MEEC)
- This covers a wide range and ensures the pool stays active

### Step 4 — Set amounts

Enter how much ETH and MEEC you want to provide as initial liquidity. The ratio determines the initial price:
- Example: 1 ETH + 1,000,000 MEEC = initial price of 0.000001 ETH per MEEC

### Step 5 — Approve and add

1. Approve MEEC spending (one transaction)
2. Add liquidity (second transaction)
3. You receive LP tokens representing your pool share

> **Important:** The initial price you set here becomes the market price. Choose carefully based on your target valuation.

---

## 13. Locking LP Tokens

LP token locking proves to buyers that the liquidity cannot be removed (rug-pull protection). This is one of the most important trust signals for a new token.

**Recommended:** Lock 100% of LP tokens for a minimum of 12 months.

### Method 1 — Unicrypt

1. Go to https://unicrypt.network
2. Connect your MetaMask wallet
3. Click **Liquidity Lockers → Uniswap V3**
4. Select your MEEC/ETH pool position (your LP NFT)
5. Set lock duration: minimum 12 months (longer = more trust)
6. Pay the locking fee (small ETH fee)
7. Confirm the transaction

Unicrypt gives you a public lock page URL — share this widely.

### Method 2 — Team Finance

1. Go to https://team.finance
2. Connect wallet
3. Select **Lock Liquidity**
4. Select Uniswap V3 and your LP position
5. Set duration and confirm

### After locking

- Copy the lock URL from Unicrypt/Team Finance
- Post it on your website, Etherscan token page description, Telegram, and Twitter
- This URL proves that liquidity is locked and for how long

---

## 14. Security Scanner Submission

After deployment and LP locking, submit to all major scanners. A locked LP dramatically improves scores.

### Token Sniffer

1. Go to https://tokensniffer.com
2. Enter: `0xYourMainnetContractAddress`
3. Target score: **85+/100**
4. If score is lower than expected, check which flags are raised and compare against `ME_Token_Prohibited_Practices.md`

### GoPlus Security

1. Go to https://gopluslabs.io/token-security
2. Select **Ethereum** chain
3. Enter contract address
4. Review all fields — every field should show `0` (no risk) or `1` (open source)
5. Target: **0 red fields**

### Honeypot.is

1. Go to https://honeypot.is
2. Select **Ethereum** network
3. Enter contract address
4. Expected result: **"Is not a Honeypot"**
5. Buy tax should show **0%**, sell tax should show **0%**

### DexScreener

1. Go to https://dexscreener.com
2. Search your contract address
3. After Uniswap liquidity is added, the pair appears automatically
4. Check the security badge — should show green/safe indicators from GoPlus

### CoinGecko / CoinMarketCap (optional)

After achieving sufficient trading volume and liquidity:
- CoinGecko listing: https://www.coingecko.com/en/coins/recently_added
- CoinMarketCap listing: requires application via their portal

---

## 15. Troubleshooting

### "Insufficient funds for gas"

Your deployer wallet doesn't have enough ETH. Add ETH and retry.

### "Nonce too high" or "Nonce too low"

A stuck transaction. In MetaMask: Settings → Advanced → Reset Account. Then retry.

### Etherscan verification fails: "Already verified"

The contract is already verified — this is not an error. Check Etherscan to confirm.

### Etherscan verification fails: "Bytecode mismatch"

The source code doesn't match what was deployed. This usually means the contract was compiled with different settings. Ensure `hardhat.config.js` has optimizer enabled with 200 runs (it already does).

### Verification fails: "Invalid API key"

Your `ETHERSCAN_API_KEY` in `.env` is wrong or expired. Generate a new one at https://etherscan.io/myapikey.

### Deploy script exits with no output

Your `ALCHEMY_*_URL` is likely wrong or empty. Double-check the `.env` file.

### "Error: Cannot find module 'hardhat'"

Dependencies not installed. Run `npm install` first.

### Token not showing on Uniswap

Uniswap auto-detects tokens from their default token list. New tokens won't appear in the search until they're added to the list or you paste the contract address directly into the Uniswap search bar.

### High gas fees on mainnet

Gas fees vary by network congestion. Check current gas prices at https://etherscan.io/gastracker and deploy when gas is low (typically weekends or off-peak hours UTC).

---

## Quick Reference

### Commands

```bash
npm install                   # Install dependencies (first time only)
npm test                      # Run all 24 tests
npm run compile               # Compile contracts
npm run coverage              # Generate test coverage report
npm run deploy:sepolia        # Deploy to Sepolia testnet
npm run deploy:mainnet        # Deploy to Ethereum mainnet
npm run verify:sepolia        # Manually verify on Sepolia Etherscan
npm run verify:mainnet        # Manually verify on mainnet Etherscan
```

### Manual verification command (if scripts fail)

```bash
npx hardhat verify --network sepolia 0xContractAddress 0xRecipientAddress
npx hardhat verify --network mainnet 0xContractAddress 0xRecipientAddress
```

### Key URLs

| Service | URL |
|---|---|
| Sepolia Etherscan | https://sepolia.etherscan.io |
| Mainnet Etherscan | https://etherscan.io |
| Alchemy Dashboard | https://dashboard.alchemy.com |
| Etherscan API Keys | https://etherscan.io/myapikey |
| Sepolia Faucet | https://sepoliafaucet.com |
| Uniswap v3 | https://app.uniswap.org/pool |
| Unicrypt LP Lock | https://unicrypt.network |
| Team Finance Lock | https://team.finance |
| Token Sniffer | https://tokensniffer.com |
| GoPlus Security | https://gopluslabs.io/token-security |
| Honeypot.is | https://honeypot.is |
| DexScreener | https://dexscreener.com |

### Contract details (filled in after deployment)

```
Sepolia contract address : ___________________________________________
Mainnet contract address : ___________________________________________
Deployer wallet address  : ___________________________________________
Uniswap pool address     : ___________________________________________
Unicrypt lock URL        : ___________________________________________
Deployment date          : ___________________________________________
```

---

## Final Deployment Order Summary

```
1.  npm install
2.  cp .env.example .env  →  fill in all 4 values
3.  npm test              →  24/24 must pass
4.  npm run deploy:sepolia
5.  Validate on Sepolia Etherscan (Read Contract values)
6.  Validate on Honeypot.is (Sepolia)
7.  Validate on Token Sniffer (Sepolia)
8.  Send test transfer on Sepolia
9.  npm run deploy:mainnet
10. Validate on Mainnet Etherscan (Read Contract values)
11. Distribute tokens to old users (transfers from deployer wallet)
12. Add liquidity on Uniswap v3
13. Lock 100% of LP tokens on Unicrypt (minimum 12 months)
14. Publish lock URL everywhere
15. Submit to Token Sniffer, GoPlus, Honeypot.is, DexScreener
16. Announce verified contract address on all channels
```
