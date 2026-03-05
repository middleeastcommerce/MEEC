# Middle East E-Commerce (MEEC) Token — Requirements Specification

## 1. Token Metadata

| Parameter | Value | Rationale |
|---|---|---|
| Name | Middle East E-Commerce | Human-readable identifier shown on explorers and exchanges |
| Symbol | MEEC | Ticker used for trading |
| Decimals | 18 | Ethereum standard; matches ETH and most ERC-20s; enables fractional amounts |
| Initial Supply | Configurable at deploy time | All tokens minted at construction to the deployer address; no future minting |
| Max Supply | Equal to initial supply (fixed) | Supply is immutable; no mechanism to create additional tokens |

---

## 2. Feature Decisions

### Included Features

#### Standard ERC-20 (OpenZeppelin `ERC20`)
- **What:** `transfer`, `transferFrom`, `approve`, `allowance`, `balanceOf`, `totalSupply`
- **Why:** Required for ERC-20 compliance. Enables wallets, DEXs, and CEXs to list and trade the token without any special integration.

#### Burnable (`ERC20Burnable`)
- **What:** Any holder can call `burn(amount)` or `burnFrom(address, amount)` to permanently destroy tokens they own.
- **Why:** Holder-controlled only — no admin can burn other users' tokens. Token scanners treat this as neutral to positive. Reduces circulating supply over time if holders choose to burn.

#### Gasless Approvals — EIP-2612 (`ERC20Permit`)
- **What:** Holders can approve a spender via an off-chain signature rather than an on-chain transaction. The spender then calls `permit(...)` and `transferFrom` in a single transaction.
- **Why:** Improves UX by removing the two-transaction approve-then-transfer flow. No admin control involved. Scanners treat this as neutral to positive.

### Excluded Features (and why)

#### Ownable / Access Control
- **Excluded because:** Any owner-controlled function is flagged as a risk by Token Sniffer, DexScreener, GoPlus, and Honeypot.is. An owner key could theoretically be compromised or used maliciously. Removing `Ownable` entirely means there is no admin surface after deployment.

#### Mint after deployment
- **Excluded because:** Post-deployment minting is the primary rug-pull vector. Scanners mark any `mint` function accessible to an owner as a CRITICAL risk. All supply is fixed at construction.

#### Pause / Emergency stop
- **Excluded because:** A `pause()` function means an admin can freeze all token transfers, effectively trapping holders' funds. Scanners rate this as HIGH risk.

#### Blacklist / Whitelist / Transfer restrictions
- **Excluded because:** Any function that can block specific addresses from selling is a honeypot red flag. Scanners will mark the token as dangerous.

#### Fee-on-transfer (tax)
- **Excluded because:** Hidden fees cause unexpected loss for buyers. DexScreener and others flag fee-on-transfer tokens. Standard ERC-20 behavior — no fees on any transfer.

#### Proxy / Upgradeable pattern
- **Excluded because:** An upgradeable contract can have its logic replaced post-deployment, which defeats the purpose of immutability. Scanners flag proxy patterns as HIGH risk.

---

## 3. Security Goals

1. **Scanner green badge:** The contract must receive a safe/green rating on Token Sniffer, DexScreener, GoPlus Security, and Honeypot.is.
2. **No owner control:** Zero admin functions after deployment. No private key can affect token behavior.
3. **Immutability:** Contract logic cannot be changed after deployment (no proxy, no `selfdestruct`).
4. **No honeypot characteristics:** All holders must be able to sell freely at any time.
5. **Transparency:** Source code must be verified on Etherscan so anyone can audit it.

---

## 4. Deployment Requirements

| Step | Requirement |
|---|---|
| Testnet | Deploy to Sepolia first for validation |
| Mainnet | Deploy to Ethereum mainnet after successful testnet verification |
| Etherscan verification | Source must be verified on both Sepolia Etherscan and mainnet Etherscan |
| Constructor args | `recipient` (deployer address) and `totalSupply_` must be logged for verification |
| Confirmations | Wait minimum 5 block confirmations before verification |

---

## 5. Post-Deployment Checklist

These steps are outside the smart contract but are critical for achieving a green badge:

- [ ] Verify source code on Etherscan (removes "unverified contract" risk flag)
- [ ] Add initial liquidity on Uniswap v3 (makes token tradeable)
- [ ] Lock LP tokens via Unicrypt or Team Finance (removes liquidity rug-pull flag)
- [ ] Submit contract address to Token Sniffer (tokensniffer.com)
- [ ] Check on Honeypot.is (honeypot.is) — confirm no honeypot detection
- [ ] Check on GoPlus Security (gopluslabs.io) — review full security report
- [ ] Check on DexScreener — confirm green safety rating

---

## 6. Test Coverage Target

- **Line coverage:** 100%
- **Branch coverage:** 100%
- **Function coverage:** 100%

All ERC-20 standard functions, burn paths, and permit signature flows must be covered by automated tests before mainnet deployment.
