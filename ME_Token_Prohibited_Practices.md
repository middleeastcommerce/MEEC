# 🚫 ME Token — Prohibited Functions & Practices
### Developer Reference: Everything That Triggers a Risk Badge

> **Purpose of this document:** This is the complete technical reference for the ME token smart contract developer. Every item listed here will trigger a red flag, risk badge, or score penalty on one or more of the major security scanning platforms: **Token Sniffer**, **GoPlus Security API**, **Honeypot.is**, **De.Fi Scanner**, **DEXTools (DEXT Score)**, **CertiK**, and **Hacken**. If it's in this document — it must not exist anywhere in the contract code.

> **Core principle of automated scanners:** They read the code. They do not read intentions. A Timelock, a Multisig, or a comment explaining why a function exists does not hide it from scanners. **If the pattern exists in bytecode — the warning fires. The only fix is deletion.**

---

## Table of Contents

1. [Hard Flags — Instant Red Badge](#1-hard-flags--instant-red-badge)
   - [1.1 Mintable / Owner Mint Function](#11-mintable--owner-mint-function)
   - [1.2 Transfer Pausable](#12-transfer-pausable)
   - [1.3 Blacklist / Address Blocking Function](#13-blacklist--address-blocking-function)
   - [1.4 Sell Tax / Buy Tax / Transfer Fees](#14-sell-tax--buy-tax--transfer-fees)
   - [1.5 Early Sell Fee / Time-Based Tax](#15-early-sell-fee--time-based-tax)
   - [1.6 Selfdestruct Function](#16-selfdestruct-function)
   - [1.7 Unverified / Hidden Source Code](#17-unverified--hidden-source-code)
   - [1.8 Hidden Owner / Shadow Ownership](#18-hidden-owner--shadow-ownership)
   - [1.9 Owner Can Change Balances](#19-owner-can-change-balances)
   - [1.10 Can Take Back Ownership](#110-can-take-back-ownership)
   - [1.11 Honeypot — Cannot Sell All Tokens](#111-honeypot--cannot-sell-all-tokens)
   - [1.12 Unprotected Proxy / Upgradeable Contract](#112-unprotected-proxy--upgradeable-contract)
2. [Soft Flags — Score Penalties & Warnings](#2-soft-flags--score-penalties--warnings)
   - [2.1 Auto-Liquidity Fee in Transfer Logic](#21-auto-liquidity-fee-in-transfer-logic)
   - [2.2 Max Transaction / Max Wallet Limits](#22-max-transaction--max-wallet-limits)
   - [2.3 Trading Cooldown Between Transactions](#23-trading-cooldown-between-transactions)
   - [2.4 Anti-Whale Mechanism (Modifiable)](#24-anti-whale-mechanism-modifiable)
   - [2.5 Whitelist Exemptions](#25-whitelist-exemptions)
   - [2.6 Slippage Modifiable by Owner](#26-slippage-modifiable-by-owner)
   - [2.7 Personal / Per-Address Slippage Override](#27-personal--per-address-slippage-override)
   - [2.8 Unlocked or Short-Duration Liquidity](#28-unlocked-or-short-duration-liquidity)
   - [2.9 Wallet Concentration Above Threshold](#29-wallet-concentration-above-threshold)
   - [2.10 External Calls in Transfer Logic](#210-external-calls-in-transfer-logic)
   - [2.11 Single EOA Owner (No Multisig)](#211-single-eoa-owner-no-multisig)
   - [2.12 Missing or Short Timelock](#212-missing-or-short-timelock)
3. [Code Quality Flags — Audit Failures](#3-code-quality-flags--audit-failures)
   - [3.1 Reentrancy Vulnerability](#31-reentrancy-vulnerability)
   - [3.2 Integer Overflow / Underflow (Pre-0.8)](#32-integer-overflow--underflow-pre-08)
   - [3.3 Unrestricted Access Control](#33-unrestricted-access-control)
   - [3.4 Flash Loan Attack Vectors](#34-flash-loan-attack-vectors)
   - [3.5 Front-Running Vulnerabilities](#35-front-running-vulnerabilities)
   - [3.6 Copied / Cloned Scam Contract Code](#36-copied--cloned-scam-contract-code)
   - [3.7 Dead Code / Unused Variables](#37-dead-code--unused-variables)
   - [3.8 TODO / FIX Comments in Production Code](#38-todo--fix-comments-in-production-code)
   - [3.9 Missing NatSpec Documentation](#39-missing-natspec-documentation)
   - [3.10 Missing SPDX License / Unlocked Pragma](#310-missing-spdx-license--unlocked-pragma)
   - [3.11 Insufficient Test Coverage](#311-insufficient-test-coverage)
   - [3.12 Gas Inefficiency Patterns](#312-gas-inefficiency-patterns)
4. [Platform-Specific Flag Reference Table](#4-platform-specific-flag-reference-table)
5. [Prohibited Solidity Patterns — Quick Reference](#5-prohibited-solidity-patterns--quick-reference)
6. [Allowed Alternatives for Every Deleted Feature](#6-allowed-alternatives-for-every-deleted-feature)

---

## 1. Hard Flags — Instant Red Badge

> These patterns trigger an **immediate red/danger badge** regardless of any other context. No governance mechanism, Timelock, or admin restriction will prevent these flags from firing. They must be **completely absent from the compiled bytecode**.

---

### 1.1 Mintable / Owner Mint Function

**GoPlus field:** `is_mintable = 1`
**Platforms affected:** GoPlus (200+ integrated apps), Token Sniffer (−40 to −60 pts), DEXTools, De.Fi Scanner, CertiK
**Severity:** 🔴 Critical — Instant red badge across all major platforms

**What it is:** Any function that allows a privileged address (owner, admin, minter role) to create new tokens after the contract is deployed.

**Prohibited patterns — none of these may exist in any form:**

```solidity
// ❌ PROHIBITED — Direct mint function
function mint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
}

// ❌ PROHIBITED — Named owner mint
function ownerMint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
}

// ❌ PROHIBITED — Role-based mint (even with AccessControl)
function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
    _mint(to, amount);
}

// ❌ PROHIBITED — Capped mint still triggers the flag
function mint(address to, uint256 amount) external onlyOwner {
    require(totalSupply() + amount <= MAX_SUPPLY, "cap exceeded");
    _mint(to, amount);  // Still flagged — the function exists
}

// ❌ PROHIBITED — Emergency mint with conditions
function emergencyMint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
}

// ❌ PROHIBITED — Any role definition named MINTER_ROLE
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
```

**Why it fires:** GoPlus and Token Sniffer detect the presence of `_mint()` calls reachable by a privileged role at any point after constructor execution. The scanner does not care about caps, conditions, or governance — it sees the call path and fires `is_mintable = 1`.

**Correct implementation:**

```solidity
// ✅ CORRECT — Mint everything in constructor, no mint function after
constructor() ERC20("ME Token", "ME") {
    _mint(msg.sender, 1_000_000_000 * 10**18); // 100% minted at deploy
    // Immediately transfer to Vesting contracts
}
// No mint() function anywhere in the contract
```

---

### 1.2 Transfer Pausable

**GoPlus field:** `transfer_pausable = 1`
**Platforms affected:** GoPlus (200+ apps including Trust Wallet, 1inch), Token Sniffer (−30 to −45 pts), De.Fi Scanner, DEXTools
**Severity:** 🔴 Critical — Instant red badge, visible to all Trust Wallet users immediately

**What it is:** Any mechanism that allows transfers to be frozen, paused, or stopped by a privileged address.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — OpenZeppelin Pausable inheritance
import "@openzeppelin/contracts/security/Pausable.sol";
contract METoken is ERC20, Pausable { ... }

// ❌ PROHIBITED — pause() function
function pause() external onlyOwner {
    _pause();
}

// ❌ PROHIBITED — whenNotPaused modifier on _transfer
function _transfer(address from, address to, uint256 amount)
    internal override whenNotPaused { ... }

// ❌ PROHIBITED — Custom pause boolean
bool public paused = false;
function setPaused(bool _paused) external onlyOwner {
    paused = _paused;
}
function _transfer(...) internal override {
    require(!paused, "paused");
    ...
}

// ❌ PROHIBITED — Trading enabled flag (same effect)
bool public tradingEnabled = false;
function enableTrading() external onlyOwner {
    tradingEnabled = true;
}
function _transfer(...) internal override {
    require(tradingEnabled, "not enabled");
    // Also flagged — same scannable pattern
}
```

**Why it fires:** Any boolean gate or modifier on `_transfer()` that a privileged address controls is detected as `transfer_pausable`. The scanner simulates a buy and sell — if an admin could block the sell path, the flag fires.

**Correct implementation:**
Emergency controls belong in the **application layer** (your DEX frontend, API, or off-chain compliance system), never in the token contract itself.

---

### 1.3 Blacklist / Address Blocking Function

**GoPlus field:** `is_blacklisted = 1`
**Platforms affected:** GoPlus (200+ apps), Token Sniffer (−25 to −40 pts), De.Fi Scanner, CertiK
**Severity:** 🔴 Critical — One of the most common fraud patterns flagged by GoPlus 2024 report

**What it is:** Any mapping or function that allows an admin to block specific addresses from sending or receiving tokens.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Classic blacklist mapping
mapping(address => bool) public isBlacklisted;
function blacklist(address account) external onlyOwner {
    isBlacklisted[account] = true;
}
function _transfer(...) internal override {
    require(!isBlacklisted[from] && !isBlacklisted[to], "blacklisted");
    ...
}

// ❌ PROHIBITED — Named differently but same pattern
mapping(address => bool) private _blocked;
mapping(address => bool) public banned;
mapping(address => bool) public restricted;

// ❌ PROHIBITED — Role-based blocking
bytes32 public constant BLACKLIST_ROLE = keccak256("BLACKLIST_ROLE");

// ❌ PROHIBITED — Block function with any name
function blockAddress(address account) external onlyOwner { ... }
function banWallet(address account) external onlyOwner { ... }
function addToBlocklist(address account) external onlyOwner { ... }
function restrictAddress(address account) external onlyOwner { ... }

// ❌ PROHIBITED — Anti-bot blacklist (same flag)
mapping(address => bool) public isBot;
function setBot(address bot, bool value) external onlyOwner {
    isBot[bot] = value;
}
```

**Why it fires:** The scanner detects any mapping from `address => bool` used as a gate in `_transfer()` that is writable by a privileged address. "Blacklist", "blocklist", "banned", "bot" — all names trigger the same flag.

**Correct implementation:** Address blocking is handled off-chain through KYC, compliance layers, or at the DEX/application interface level.

---

### 1.4 Sell Tax / Buy Tax / Transfer Fees

**GoPlus fields:** `sell_tax > 0`, `buy_tax > 0`
**Platforms affected:** GoPlus (red if >10%, Honeypot classification if >49%), Honeypot.is (any sell fee = Honeypot), Token Sniffer (−35 to −55 pts), DEXTools
**Severity:** 🔴 Critical — Any sell tax triggers Honeypot classification on Honeypot.is. Buy tax triggers GoPlus warning above 10%.

**What it is:** Any fee deducted from the token amount during a transfer, buy, or sell operation.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Standard fee on transfer
uint256 public sellFee = 5;  // 5%
function _transfer(address from, address to, uint256 amount)
    internal override {
    uint256 fee = (amount * sellFee) / 100;
    super._transfer(from, feeWallet, fee);
    super._transfer(from, to, amount - fee);
}

// ❌ PROHIBITED — Buy and sell fees
uint256 public buyFee = 3;
uint256 public sellFee = 3;

// ❌ PROHIBITED — Treasury fee
uint256 public treasuryFee = 2;
uint256 public liquidityFee = 2;
uint256 public marketingFee = 1;

// ❌ PROHIBITED — Fee with any name
uint256 public reflectionFee;
uint256 public burnFee;
uint256 public developmentFee;
uint256 public rewardFee;

// ❌ PROHIBITED — Any non-zero fee deducted in _transfer()
function _transfer(...) internal override {
    uint256 taxAmount = amount * taxRate / 1000;
    // Any deduction here = Honeypot flag
}

// ❌ PROHIBITED — Even 1% fee triggers the flag
uint256 public constant FEE = 10; // 1% in basis points — STILL FLAGGED
```

**Why it fires:** Honeypot.is performs an **actual on-chain transaction** — it buys then immediately tries to sell. Any fee deducted from the sell output is detected in real-time. Even 0.1% sell fee = Honeypot classification. GoPlus simulates the same and returns `sell_tax > 0`.

**Correct implementation:**

```solidity
// ✅ CORRECT — Zero fees in transfer logic
function _transfer(address from, address to, uint256 amount)
    internal override {
    super._transfer(from, to, amount); // No deductions, no fees
}
// Revenue is generated through protocol mechanisms outside the token contract
```

---

### 1.5 Early Sell Fee / Time-Based Tax

**Platforms affected:** Honeypot.is (classified as Honeypot at launch), Token Sniffer, GoPlus
**Severity:** 🔴 Critical — This is the **most dangerous design pattern** at launch time. The simulation runs when the early lock is still active, so launch = Honeypot classification.

**What it is:** Any tax or fee that applies during an early period after purchase, based on time, block number, or transaction sequence.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Time-based early sell fee
mapping(address => uint256) public purchaseTimestamp;
uint256 public earlyFee = 10; // 10% in first 24h

function _transfer(address from, address to, uint256 amount) internal override {
    if (block.timestamp < purchaseTimestamp[from] + 24 hours) {
        uint256 fee = (amount * earlyFee) / 100;
        super._transfer(from, feeWallet, fee);
        super._transfer(from, to, amount - fee);
        return;
    }
    super._transfer(from, to, amount);
}

// ❌ PROHIBITED — Block-based early tax
mapping(address => uint256) public purchaseBlock;
uint256 public constant EARLY_TAX_BLOCKS = 100;

// ❌ PROHIBITED — Decreasing tax schedule
// Day 1: 20%, Day 2: 15%, Day 3: 10%, Day 4: 5%, Day 5+: 0%
// ALL stages are prohibited — scanner hits day 1 and flags it

// ❌ PROHIBITED — First N transactions tax
uint256 public transactionCount;
function _transfer(...) internal override {
    if (transactionCount < 1000) {
        // Apply fee
    }
    transactionCount++;
}
```

**Why it fires:** Honeypot.is and Token Sniffer run their simulation the moment the contract is live. If any time-based fee applies at T=0 (launch), the simulation catches it and the token is classified as a Honeypot instantly — before any real user buys.

---

### 1.6 Selfdestruct Function

**GoPlus field:** `selfdestruct = 1`
**Platforms affected:** GoPlus (highest risk level), CertiK (Critical severity), De.Fi Scanner (Critical), Token Sniffer
**Severity:** 🔴 Critical — Signals potential for contract destruction and complete liquidity theft in a single transaction

**What it is:** Any use of the `selfdestruct` opcode, directly or through delegatecall.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Direct selfdestruct
function destroy() external onlyOwner {
    selfdestruct(payable(owner()));
}

// ❌ PROHIBITED — Emergency selfdestruct
function emergencyDestroy(address payable recipient) external onlyOwner {
    selfdestruct(recipient);
}

// ❌ PROHIBITED — Conditional selfdestruct
function shutdown() external {
    require(msg.sender == factory, "not factory");
    selfdestruct(payable(treasury));
}

// ❌ PROHIBITED — Selfdestruct in a linked/child contract
// If any contract in your ecosystem calls selfdestruct, it flags the token

// ❌ PROHIBITED — Delegatecall to a contract that contains selfdestruct
// (even if the token itself doesn't call it directly)
```

**Why it fires:** The scanner detects the `SELFDESTRUCT` opcode anywhere in the bytecode or reachable via delegatecall. CertiK auto-classifies this as Critical with no exceptions.

---

### 1.7 Unverified / Hidden Source Code

**GoPlus field:** `is_open_source = 0`
**Platforms affected:** Token Sniffer (−100, refuses to scan entirely), GoPlus (Critical red badge), CoinGecko (fails listing requirement), CoinMarketCap (fails listing requirement)
**Severity:** 🔴 Critical — Without verified source, Token Sniffer will not evaluate the contract at all

**What it is:** Deploying a contract without publishing and verifying the full source code on Etherscan (or the chain's equivalent block explorer).

**Prohibited situations:**

```
❌ Deploying without immediately verifying on Etherscan
❌ Verifying only the main contract file but not all imported files
❌ Using a different compiler version than what was used to deploy
❌ Using optimization settings that don't match the deployed bytecode
❌ Leaving any file or library as bytecode-only without source
❌ Waiting days/weeks after deploy to verify — scanners flag immediately
```

**Correct implementation:**
- Verify **all files** on Etherscan within minutes of deployment
- Use the exact same compiler version and optimization settings as deployment
- Every import must be verifiable — use flattened source or multi-file verification
- The verification must match 100% — partial verification still triggers the flag

---

### 1.8 Hidden Owner / Shadow Ownership

**GoPlus field:** `hidden_owner = 1`
**Platforms affected:** GoPlus, De.Fi Scanner, CertiK
**Severity:** 🔴 High — Indicates a concealed controller who can act without public visibility

**What it is:** Any mechanism where true ownership or admin control is held by a non-obvious address — including proxy admin slots, storage-based owner variables that don't reflect in public getters, or shadow roles not exposed by standard AccessControl.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Hidden owner in storage slot (EIP-1967 style misuse)
bytes32 private constant _OWNER_SLOT =
    bytes32(uint256(keccak256("owner.storage")) - 1);
// Owner written directly to slot without a readable getter

// ❌ PROHIBITED — Owner not exposed publicly
address private _hiddenOwner;
// No public getter = hidden_owner flag

// ❌ PROHIBITED — Proxy admin that is a different address from apparent owner
// The proxy admin can upgrade logic; if it's separate and non-public, it fires

// ❌ PROHIBITED — Multiple ownership layers where one is not traceable on-chain
```

**Correct implementation:**
- Use a publicly readable owner address (via Ownable's `owner()` or AccessControl's role enumeration)
- Transfer ownership to a **publicly known** Gnosis Safe
- All admin roles must be queryable: `hasRole(DEFAULT_ADMIN_ROLE, address)` must return verifiable results

---

### 1.9 Owner Can Change Balances

**GoPlus field:** `owner_change_balance = 1`
**Platforms affected:** GoPlus (Critical), CertiK (Critical), De.Fi Scanner
**Severity:** 🔴 Critical — Directly signals potential for theft of user funds

**What it is:** Any function that allows a privileged address to directly increase, decrease, or overwrite the token balance of any wallet.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Direct balance manipulation
function setBalance(address account, uint256 amount) external onlyOwner {
    _balances[account] = amount;
}

// ❌ PROHIBITED — Admin burn from arbitrary address
function burnFrom(address account, uint256 amount) external onlyOwner {
    _burn(account, amount);  // Owner-callable burn on ANY address
}

// ❌ PROHIBITED — Airdrop that writes balances directly
function airdrop(address[] calldata recipients, uint256[] calldata amounts)
    external onlyOwner {
    for (uint i = 0; i < recipients.length; i++) {
        _balances[recipients[i]] += amounts[i]; // Direct balance write
    }
}

// ❌ PROHIBITED — Tax-redistribution that modifies balances directly
// Any reflection/rebase mechanism that changes balances without transfer events
```

---

### 1.10 Can Take Back Ownership

**GoPlus field:** `can_take_back_ownership = 1`
**Platforms affected:** GoPlus, De.Fi Scanner, CertiK
**Severity:** 🔴 High — Hidden re-acquisition of admin control after apparent renouncement

**What it is:** Any mechanism that allows ownership to be reclaimed after it has been transferred or renounced — including backdoors, factory patterns, or storage slot manipulation.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Reclaim function
function reclaimOwnership() external {
    require(msg.sender == originalDeployer, "not deployer");
    _transferOwnership(originalDeployer);
}

// ❌ PROHIBITED — Factory-based ownership recovery
// If a factory contract retains the ability to call transferOwnership()
// on the deployed token, this fires can_take_back_ownership

// ❌ PROHIBITED — Time-locked ownership recovery
function recoverOwnership() external {
    require(block.timestamp > recoveryTime, "too early");
    _transferOwnership(recoveryAddress);
}

// ❌ PROHIBITED — Any stored "previous owner" that has recovery rights
address private previousOwner;
```

---

### 1.11 Honeypot — Cannot Sell All Tokens

**GoPlus field:** `cannot_sell_all = 1`
**Platforms affected:** GoPlus, Honeypot.is, Token Sniffer
**Severity:** 🔴 High — Means liquidity can be withdrawn while users hold worthless tokens

**What it is:** Any contract logic that prevents a user from selling their entire token balance in one transaction.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Minimum hold requirement
function _transfer(address from, address to, uint256 amount) internal override {
    require(
        balanceOf(from) - amount >= MIN_HOLD || to == address(this),
        "must keep minimum"
    );
    super._transfer(from, to, amount);
}

// ❌ PROHIBITED — Cannot sell 100% (must keep dust)
uint256 public constant MIN_REMAINING = 1;
require(balanceOf(from) - amount >= MIN_REMAINING, "keep some tokens");

// ❌ PROHIBITED — Percentage-based sell limit
require(amount <= balanceOf(from) * 99 / 100, "cannot sell all");
```

---

### 1.12 Unprotected Proxy / Upgradeable Contract

**GoPlus field:** `is_proxy = 1`
**Platforms affected:** GoPlus (High warning), De.Fi Scanner (Critical), CertiK (High)
**Severity:** 🔴 High — Logic can be replaced after users buy, enabling post-purchase rug

**What it is:** Any transparent proxy, UUPS proxy, or upgradeable pattern where the logic contract can be swapped without sufficient governance protection.

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Standard UUPS proxy without Multisig + Timelock
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
function _authorizeUpgrade(address) internal override onlyOwner {}
// onlyOwner with a single EOA = instant high-risk flag

// ❌ PROHIBITED — Transparent proxy with single-admin ProxyAdmin
// If ProxyAdmin is controlled by one EOA, it's flagged

// ❌ PROHIBITED — Upgradeability with no Timelock
// Any upgrade path that can execute in a single transaction
```

**If a proxy is absolutely required:**
- ProxyAdmin must be controlled by a **Gnosis Safe (3-of-5 minimum)**
- A **Timelock of minimum 48 hours** must gate all upgrades
- The upgrade mechanism must be fully documented and publicly announced
- Even with these protections, `is_proxy = 1` will still show — but the risk level may be downgraded by auditors

---

## 2. Soft Flags — Score Penalties & Warnings

> These patterns do not instantly turn the badge red but will reduce your Token Sniffer score, lower your DEXT Score, add warning entries on De.Fi and GoPlus, and can push your total score below the "Low Risk" threshold if multiple soft flags stack. Each one listed here should be avoided or handled carefully.

---

### 2.1 Auto-Liquidity Fee in Transfer Logic

**Platforms affected:** Token Sniffer (−8 to −15 pts), De.Fi Scanner (Medium warning)
**Severity:** 🟠 Soft Flag — Hidden fee mechanism in transfer logic

**What it is:** Any mechanism that automatically collects a portion of every transfer and adds it to a liquidity pool (the "SafeMoon" pattern).

**Prohibited patterns:**

```solidity
// ❌ AVOID — Auto-liquidity fee
uint256 public liquidityFee = 2; // 2% per transfer to liquidity
bool private inSwapAndLiquify;

function _transfer(address from, address to, uint256 amount) internal override {
    uint256 liqAmount = (amount * liquidityFee) / 100;
    // Collect fee, swap half to ETH, add liquidity
    _swapAndLiquify(liqAmount);
    super._transfer(from, to, amount - liqAmount);
}
```

**Correct alternative:** Treasury wallet (managed by Gnosis Safe) manually adds liquidity on a published schedule — fully transparent, no hidden deductions from transfers.

---

### 2.2 Max Transaction / Max Wallet Limits

**GoPlus field:** `is_anti_whale = 1` / Max Transaction flag
**Platforms affected:** Token Sniffer (−10 to −20 pts), GoPlus (medium warning)
**Severity:** 🟠 Soft Flag — Restricts trading freedom, interpreted as a potential rug mechanism

**Prohibited patterns:**

```solidity
// ❌ AVOID — Max transaction limit
uint256 public maxTxAmount = 5_000_000 * 10**18; // 0.5% of supply
function _transfer(...) internal override {
    require(amount <= maxTxAmount, "exceeds max tx");
    ...
}

// ❌ AVOID — Max wallet holding limit
uint256 public maxWalletAmount = 20_000_000 * 10**18; // 2% of supply
require(balanceOf(to) + amount <= maxWalletAmount, "exceeds max wallet");

// ❌ AVOID — Owner-adjustable limits (worse — also flags slippage_modifiable)
function setMaxTxAmount(uint256 amount) external onlyOwner { ... }
```

**If absolutely needed:** Define them as `immutable` constants set at deployment that **cannot be changed after deploy**. Adjustable limits are significantly worse than fixed ones.

---

### 2.3 Trading Cooldown Between Transactions

**GoPlus field:** `trading_cooldown = 1`
**Platforms affected:** GoPlus (medium warning), Token Sniffer
**Severity:** 🟠 Soft Flag — Limits rapid trading, interpreted negatively by scanners

**Prohibited patterns:**

```solidity
// ❌ AVOID — Cooldown between sells
mapping(address => uint256) public lastSellTimestamp;
uint256 public cooldownTime = 1 hours;

function _transfer(address from, address to, uint256 amount) internal override {
    if (to == uniswapV2Pair) { // Selling
        require(
            block.timestamp >= lastSellTimestamp[from] + cooldownTime,
            "cooldown active"
        );
        lastSellTimestamp[from] = block.timestamp;
    }
    super._transfer(from, to, amount);
}
```

---

### 2.4 Anti-Whale Mechanism (Modifiable)

**GoPlus field:** `is_anti_whale = 1`
**Platforms affected:** GoPlus, Token Sniffer
**Severity:** 🟠 Soft Flag — Additional warning if the limit is owner-adjustable

**Prohibited patterns:**

```solidity
// ❌ AVOID — Owner can change anti-whale limits post-deploy
function setMaxTx(uint256 _max) external onlyOwner {
    maxTxAmount = _max; // Modifiable = worse flag
}

// ❌ AVOID — Anti-whale with whitelist exclusions
function _transfer(address from, address to, uint256 amount) internal override {
    if (!isWhitelisted[from]) {
        require(amount <= maxTxAmount, "anti-whale");
    }
    ...
}
```

---

### 2.5 Whitelist Exemptions

**GoPlus field:** `is_whitelisted = 1`
**Platforms affected:** GoPlus (medium warning), De.Fi Scanner
**Severity:** 🟠 Soft Flag — Exemptions can be used to give insiders preferential treatment

**Prohibited patterns:**

```solidity
// ❌ AVOID — Fee whitelist
mapping(address => bool) public isWhitelisted;
function addToWhitelist(address account) external onlyOwner {
    isWhitelisted[account] = true;
}
function _transfer(address from, address to, uint256 amount) internal override {
    if (!isWhitelisted[from]) {
        // Apply fees
    }
    ...
}

// ❌ AVOID — Whitelist from max transaction limits
// Any privilege separation in transfer logic based on an owner-controlled mapping
```

---

### 2.6 Slippage Modifiable by Owner

**GoPlus field:** `slippage_modifiable = 1`
**Platforms affected:** GoPlus (medium-high warning), De.Fi Scanner
**Severity:** 🟠 Soft Flag — Owner can change taxes/fees after the fact

**Prohibited patterns:**

```solidity
// ❌ AVOID — Owner can change fees
function setSellFee(uint256 _fee) external onlyOwner {
    sellFee = _fee;
}
function setBuyFee(uint256 _fee) external onlyOwner {
    buyFee = _fee;
}
function setFees(uint256 _buy, uint256 _sell) external onlyOwner {
    buyFee = _buy;
    sellFee = _sell;
}
```

> Note: If fees are 0% (as required), this function is irrelevant — but its mere existence still triggers the flag.

---

### 2.7 Personal / Per-Address Slippage Override

**GoPlus field:** `personal_slippage_modifiable = 1`
**Platforms affected:** GoPlus (High warning)
**Severity:** 🔴 High — Allows the owner to apply custom fees to specific wallets (targeted rug)

**Prohibited patterns:**

```solidity
// ❌ PROHIBITED — Per-address fee override
mapping(address => uint256) public personalFee;
function setPersonalFee(address account, uint256 fee) external onlyOwner {
    personalFee[account] = fee;
}

// ❌ PROHIBITED — Targeted tax for specific wallets
mapping(address => bool) public isHighTaxed;
```

---

### 2.8 Unlocked or Short-Duration Liquidity

**GoPlus field:** Flagged in `lp_holders` analysis
**Platforms affected:** Token Sniffer (−20 to −35 pts if <95% locked), GoPlus, DEXTools
**Severity:** 🟠 Soft Flag — Unlocked liquidity = rug pull risk

**What to avoid:**

```
❌ Providing liquidity without immediately locking LP tokens
❌ Locking LP for less than 15 days (Token Sniffer minimum for any score)
❌ Locking less than 95% of LP tokens
❌ Using an unrecognized locking platform (not Unicrypt, Team.Finance, TrustSwap)
❌ Locking LP after making a public announcement (lock FIRST, announce after)
❌ Not publishing the lock transaction hash publicly
```

**Correct implementation:**
- Lock 100% of LP on **Unicrypt** (preferred) immediately after adding liquidity
- Minimum lock duration: **12 months**
- Publish the lock URL in: contract description on Etherscan, official website, all social channels

---

### 2.9 Wallet Concentration Above Threshold

**Platforms affected:** Token Sniffer (−15 to −25 pts if >40% in one wallet), GoPlus, DEXTools
**Severity:** 🟠 Soft Flag — High concentration in non-Vesting wallets = dump risk

**What to avoid:**

```
❌ Any single non-Vesting wallet holding more than 5% of supply
❌ Team wallets receiving tokens directly without Vesting contracts
❌ Deployer wallet retaining large balances after deploy
❌ Treasury held in a single EOA wallet (use Gnosis Safe + Vesting)
❌ Airdrop allocations sent as a lump sum without time-locks
```

**Correct implementation:**
- All token categories (team, investors, treasury, rewards) distributed to **independent Vesting contracts** at deploy
- No single address outside Vesting contracts holds >5% of supply
- Vesting contracts must be verified on-chain and publicly linked

---

### 2.10 External Calls in Transfer Logic

**GoPlus field:** `external_call = 1`
**Platforms affected:** GoPlus (medium warning), CertiK, Hacken
**Severity:** 🟠 Medium — External calls in _transfer() enable flash loan attacks and reentrancy

**Prohibited patterns:**

```solidity
// ❌ AVOID — Calling external contracts inside _transfer
function _transfer(address from, address to, uint256 amount) internal override {
    super._transfer(from, to, amount);
    IRewardContract(rewardPool).notifyTransfer(from, to, amount); // External call
}

// ❌ AVOID — Oracle calls in transfer
function _transfer(address from, address to, uint256 amount) internal override {
    uint256 price = IPriceOracle(oracle).getPrice(); // External call
    ...
}
```

---

### 2.11 Single EOA Owner (No Multisig)

**Platforms affected:** De.Fi Scanner (Medium-High), CertiK (Centralization Risk flag)
**Severity:** 🟠 Soft Flag — Single point of failure, key loss = permanent loss of governance

**What to avoid:**

```
❌ Deploying and leaving ownership with a single private key (EOA)
❌ Transferring ownership to a hardware wallet that a single person controls
❌ Using a simple 1-of-1 Safe (defeats the purpose)
❌ Having all Gnosis Safe signers in the same geographic location
❌ Naming the Gnosis Safe signers publicly without checking their security practices
```

---

### 2.12 Missing or Short Timelock

**Platforms affected:** De.Fi Scanner (Medium warning), CertiK (lowers Skynet Score), Hacken
**Severity:** 🟡 Medium — Allows instant admin actions without community reaction time

**What to avoid:**

```
❌ No Timelock contract at all
❌ Timelock with delay < 24 hours (De.Fi flags anything under 24h)
❌ Timelock that can be bypassed by the admin in emergency scenarios
❌ Deploying token before Timelock contract is live on-chain
❌ Admin functions callable without Timelock (even "minor" ones)
```

---

## 3. Code Quality Flags — Audit Failures

> These issues will be found and reported by CertiK, Hacken, and other audit firms. Any **Critical** or **High** finding in an audit report — even if fixed later — signals risk to listing platforms and may prevent the Audited badge from being awarded.

---

### 3.1 Reentrancy Vulnerability

**Audit classification:** Critical (if funds can be drained)
**Platforms affected:** CertiK, Hacken — auto-fail for Critical findings

**Prohibited patterns:**

```solidity
// ❌ CRITICAL — State change after external call (classic reentrancy)
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success,) = msg.sender.call{value: amount}(""); // External call FIRST
    require(success);
    balances[msg.sender] -= amount; // State change AFTER — exploitable
}

// ❌ CRITICAL — Missing reentrancy guard on functions with external calls
// Any function that: (1) checks state, (2) calls external contract, (3) updates state
// without a ReentrancyGuard is a potential reentrancy vector
```

**Correct implementation:**

```solidity
// ✅ CORRECT — Use OpenZeppelin ReentrancyGuard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount; // Update state FIRST (Checks-Effects-Interactions)
    (bool success,) = msg.sender.call{value: amount}("");
    require(success);
}
```

---

### 3.2 Integer Overflow / Underflow (Pre-0.8)

**Audit classification:** Critical
**Platforms affected:** CertiK, Hacken

**Prohibited patterns:**

```solidity
// ❌ CRITICAL — Using Solidity <0.8.0 without SafeMath
pragma solidity ^0.6.0; // Vulnerable to overflow by default

uint256 public totalSupply = type(uint256).max;
totalSupply + 1; // Overflows to 0 silently in <0.8.0

// ❌ CRITICAL — Using SafeMath incorrectly or inconsistently in older versions
```

**Correct implementation:** Use **Solidity 0.8.x or later** — overflow/underflow checks are built-in. Specify an exact version in pragma, not a range.

---

### 3.3 Unrestricted Access Control

**Audit classification:** Critical to High
**Platforms affected:** CertiK, Hacken, De.Fi

**Prohibited patterns:**

```solidity
// ❌ CRITICAL — Public admin function with no access restriction
function setOwner(address newOwner) public { // No modifier
    owner = newOwner;
}

// ❌ CRITICAL — tx.origin authentication (phishing-vulnerable)
modifier onlyOwner() {
    require(tx.origin == owner, "not owner"); // Use msg.sender, not tx.origin
    _;
}

// ❌ HIGH — Role initialization in a separate init function callable after deploy
function initRoles() external {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Callable by anyone if not protected
}

// ❌ HIGH — DEFAULT_ADMIN_ROLE granted to address(0) or left unassigned
// ❌ HIGH — Roles that can be granted by non-admin addresses
```

---

### 3.4 Flash Loan Attack Vectors

**Audit classification:** High to Critical
**Platforms affected:** CertiK, Hacken

**Prohibited patterns:**

```solidity
// ❌ HIGH — Price calculated from a manipulable on-chain source
function getTokenPrice() internal view returns (uint256) {
    // Reading price from Uniswap spot = flash loan manipulable
    (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pair).getReserves();
    return reserve1 / reserve0;
}

// ❌ HIGH — Governance actions executable in a single block
// An attacker can borrow governance tokens, vote, execute, repay in one tx

// ❌ HIGH — Liquidity-based calculations in the same transaction as add/remove
```

---

### 3.5 Front-Running Vulnerabilities

**Audit classification:** Medium to High
**Platforms affected:** CertiK, Hacken

**Prohibited patterns:**

```solidity
// ❌ MEDIUM — Predictable randomness
function selectWinner() external {
    uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
    // block values are visible to validators — exploitable
}

// ❌ MEDIUM — No deadline on DEX interactions
// Any swap or liquidity operation without a deadline parameter
// can be sandwiched by MEV bots

// ❌ MEDIUM — Approve + transferFrom without permit() (EIP-2612)
// Classic ERC-20 approve is front-runnable — use permit() pattern instead
```

---

### 3.6 Copied / Cloned Scam Contract Code

**Platforms affected:** Token Sniffer (−5 to −10 pts), CertiK, Hacken
**Severity:** 🟠 Medium — Similarity to known fraudulent contracts triggers automatic deductions

**Prohibited situations:**

```
❌ Copying any contract that has been flagged in Token Sniffer's scam database
❌ Forking SafeMoon, Squid Game token, or any contract involved in a documented rug pull
❌ Using contract templates from unaudited GitHub repositories without full review
❌ Lifting large sections of logic from multiple contracts without understanding them
❌ Using identical function names, variable names, and logic flow to a known scam
```

---

### 3.7 Dead Code / Unused Variables

**Audit classification:** Informational to Low
**Platforms affected:** De.Fi Scanner (Informational flag), Hacken (requirement for clean submission)

**Prohibited patterns:**

```solidity
// ❌ AVOID — Unused state variables
uint256 public unusedVariable; // Never read or written after initialization

// ❌ AVOID — Commented-out code blocks left in production
// function oldMint(address to, uint256 amount) external {
//     _mint(to, amount);
// }

// ❌ AVOID — Unreachable code
function transfer(address to, uint256 amount) public override returns (bool) {
    return false; // This code is unreachable because the next line always executes
    return super.transfer(to, amount);
}

// ❌ AVOID — Unused function parameters
function doSomething(address user, uint256 amount, bool flag) external {
    // 'flag' is never used — compiler warning, auditor flag
}

// ❌ AVOID — Unused imports
import "@openzeppelin/contracts/security/Pausable.sol"; // Not used anywhere
```

---

### 3.8 TODO / FIX Comments in Production Code

**Platforms affected:** Hacken (hard requirement — will reject audit submission), De.Fi Scanner
**Severity:** 🟠 Medium — Hacken explicitly rejects contracts with unresolved TODO comments

**Prohibited:**

```solidity
// ❌ PROHIBITED — Any TODO in production-submitted code
// TODO: add validation here
// TODO: implement fee logic
// TODO: check if this is secure
// FIXME: this might cause issues with large amounts
// HACK: temporary workaround
// XXX: needs review before mainnet
// NOTE: not sure about this logic
```

**All TODOs, FIXMEs, HACKs, and unresolved inline notes must be resolved before submitting for audit.**

---

### 3.9 Missing NatSpec Documentation

**Platforms affected:** Hacken (requirement for >95% coverage), CertiK (Skynet Score impact), De.Fi
**Severity:** 🟡 Low-Medium — Missing documentation reduces audit quality and Skynet Score

**Prohibited situations:**

```solidity
// ❌ AVOID — Public/external functions without NatSpec
function transfer(address to, uint256 amount) public override returns (bool) {
    return super.transfer(to, amount);
    // No @notice, no @param, no @return
}

// ❌ AVOID — State variables without NatSpec
uint256 public maxSupply; // No /// comment explaining what this is

// ❌ AVOID — Events without NatSpec
event TokensBurned(address indexed burner, uint256 amount); // No documentation
```

**Correct implementation:**

```solidity
/// @notice Returns the maximum token supply that can ever exist
/// @return The immutable maximum supply in wei
uint256 public immutable maxSupply;

/// @notice Transfers tokens to a recipient
/// @param to The address of the recipient
/// @param amount The amount of tokens to transfer in wei
/// @return success True if the transfer succeeded
function transfer(address to, uint256 amount)
    public override returns (bool success) {
    return super.transfer(to, amount);
}
```

---

### 3.10 Missing SPDX License / Unlocked Pragma

**Platforms affected:** CertiK, Hacken, Slither (static analysis tool)
**Severity:** 🟡 Low — Informational but required for a clean audit

**Prohibited patterns:**

```solidity
// ❌ AVOID — Missing SPDX license identifier
pragma solidity ^0.8.24;
// No SPDX — Slither and auditors flag this

// ❌ AVOID — Floating pragma (version range)
pragma solidity ^0.8.0; // Could compile with any 0.8.x — use exact version
pragma solidity >=0.8.0 <0.9.0; // Range is worse

// ❌ AVOID — Outdated Solidity version
pragma solidity 0.6.12; // Multiple known vulnerabilities
pragma solidity 0.7.6;  // Missing overflow protection
```

**Correct implementation:**

```solidity
// ✅ CORRECT
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24; // Exact version pinned
```

---

### 3.11 Insufficient Test Coverage

**Platforms affected:** Hacken (requires >95% coverage), CertiK (coverage affects score)
**Severity:** 🟠 Medium — Low coverage means undetected bugs, and auditors will flag it

**Prohibited situations:**

```
❌ Submitting for audit with test coverage below 95%
❌ Testing only the happy path — no edge cases, no failure modes
❌ No tests for role-based access control (calling admin functions as non-admin)
❌ No tests for boundary conditions (zero amounts, max uint256, empty arrays)
❌ No tests for the Vesting contract cliff and release logic
❌ No integration tests simulating a real DEX buy/sell cycle
❌ Using only manual testing with no automated test suite
```

**Required tooling:** Hardhat + ethers.js with `solidity-coverage`. Coverage report must be included in the audit submission package.

---

### 3.12 Gas Inefficiency Patterns

**Platforms affected:** Hacken (flags in audit report), CertiK (Informational findings)
**Severity:** 🟡 Informational — Doesn't cause a red badge but will appear in audit reports

**Prohibited patterns:**

```solidity
// ❌ AVOID — Reading storage variables multiple times in a loop
for (uint i = 0; i < holders.length; i++) {
    balances[holders[i]] += rewardAmount; // Storage read/write in loop
}

// ❌ AVOID — Not caching array length in loops
for (uint i = 0; i < holders.length; i++) { // holders.length read every iteration
    ...
}
// ✅ CORRECT: uint256 len = holders.length; for (uint i = 0; i < len; i++)

// ❌ AVOID — Using uint8/uint16 where uint256 is more gas-efficient
// (except in structs where packing matters)

// ❌ AVOID — Emitting events with redundant data already in the transaction

// ❌ AVOID — Using string in storage when bytes32 suffices
string public name = "ME Token"; // OK for ERC-20 standard
// But avoid string for internal identifiers — use bytes32
```

---

## 4. Platform-Specific Flag Reference Table

| Flag / Pattern | Token Sniffer | GoPlus | Honeypot.is | De.Fi | DEXTools | CertiK | Hacken |
|---|---|---|---|---|---|---|---|
| Mintable / ownerMint | −40 to −60 | 🔴 `is_mintable=1` | | 🔴 | 🔴 | High | High |
| Transfer Pausable | −30 to −45 | 🔴 `transfer_pausable=1` | | 🔴 | 🔴 | | |
| Blacklist Function | −25 to −40 | 🔴 `is_blacklisted=1` | | 🔴 | | High | |
| Sell Tax > 0% | −35 to −55 | 🔴 if >10% | 🔴 Honeypot | 🔴 | 🔴 | | |
| Buy Tax > 0% | penalty | 🔴 if >10% | | 🟠 | 🟠 | | |
| Early Sell Fee | 🔴 Honeypot | 🔴 | 🔴 Honeypot | 🔴 | | | |
| Selfdestruct | penalty | 🔴 `selfdestruct=1` | | 🔴 | | Critical | Critical |
| Unverified Code | 🔴 refuses scan | 🔴 `is_open_source=0` | | 🔴 | 🔴 | | |
| Hidden Owner | | 🔴 `hidden_owner=1` | | 🔴 | | High | |
| Owner Changes Balances | | 🔴 `owner_change_balance=1` | | 🔴 | | Critical | Critical |
| Can Take Back Ownership | | 🔴 `can_take_back_ownership=1` | | 🔴 | | High | |
| Cannot Sell All | | 🔴 `cannot_sell_all=1` | 🔴 Honeypot | | | | |
| Unprotected Proxy | | 🔴 `is_proxy=1` | | 🔴 | | High | |
| Auto-Liquidity Fee | −8 to −15 | 🟠 | | 🟠 | | | |
| Max Tx / Max Wallet | −10 to −20 | 🟠 `is_anti_whale=1` | | 🟠 | | | |
| Trading Cooldown | penalty | 🟠 `trading_cooldown=1` | | 🟠 | | | |
| Whitelist Exemptions | | 🟠 `is_whitelisted=1` | | 🟠 | | | |
| Slippage Modifiable | | 🟠 `slippage_modifiable=1` | | 🟠 | | | |
| Personal Slippage | | 🔴 `personal_slippage_modifiable=1` | | 🔴 | | | |
| Unlocked Liquidity (<95%) | −20 to −35 | 🟠 LP flag | | 🟠 | 🟠 | | |
| Wallet Concentration >40% | −15 to −25 | 🟠 | | 🟠 | 🟠 | | |
| External Call in Transfer | | 🟠 `external_call=1` | | 🟠 | | Medium | Medium |
| Single EOA Owner | | | | 🟠 | | Centralization | Centralization |
| No Timelock | | | | 🟡 | | Skynet impact | |
| Reentrancy | | | | 🔴 | | Critical | Critical |
| Copied Scam Code | −5 to −10 | | | 🟠 | | | Medium |
| Dead Code / TODOs | | | | 🟡 | | Info | Reject |
| No NatSpec | | | | 🟡 | | Info | Required |
| Low Test Coverage | | | | | | Score impact | Reject |

---

## 5. Prohibited Solidity Patterns — Quick Reference

This section lists every **prohibited Solidity keyword, import, and pattern** in a compact format for quick review during development.

### Prohibited Imports (OpenZeppelin)

```solidity
❌ import "@openzeppelin/contracts/security/Pausable.sol";
❌ import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
❌ import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
❌ import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
// Only import Pausable or Upgradeable proxies if you have an exceptional reason
// and full Multisig + Timelock governance — even then, is_proxy=1 will still show
```

### Prohibited State Variables

```solidity
❌ bool public paused;
❌ bool public tradingEnabled;
❌ bool public tradingOpen;
❌ mapping(address => bool) public isBlacklisted;
❌ mapping(address => bool) public blacklist;
❌ mapping(address => bool) public banned;
❌ mapping(address => bool) public isBot;
❌ mapping(address => bool) public blocked;
❌ mapping(address => bool) public restricted;
❌ mapping(address => bool) public isWhitelisted;
❌ mapping(address => uint256) public personalFee;
❌ mapping(address => uint256) public purchaseTimestamp; // for early fee
❌ mapping(address => uint256) public lastSellTimestamp; // for cooldown
❌ uint256 public sellFee; // any non-zero value
❌ uint256 public buyFee;  // any non-zero value
❌ uint256 public transferFee;
❌ uint256 public liquidityFee;
❌ uint256 public marketingFee;
❌ uint256 public rewardFee;
❌ uint256 public burnFee;
❌ uint256 public reflectionFee;
❌ uint256 public earlyFee;
❌ uint256 public maxTxAmount;  // if owner-adjustable
❌ uint256 public maxWalletAmount; // if owner-adjustable
❌ address private _hiddenOwner;
❌ address private previousOwner;
❌ bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
❌ bytes32 public constant BLACKLIST_ROLE = keccak256("BLACKLIST_ROLE");
❌ bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
```

### Prohibited Function Signatures

```solidity
❌ function mint(address, uint256) external
❌ function ownerMint(address, uint256) external
❌ function emergencyMint(address, uint256) external
❌ function pause() external
❌ function unpause() external
❌ function setPaused(bool) external
❌ function enableTrading() external  // only if it gates _transfer
❌ function blacklist(address) external
❌ function unblacklist(address) external
❌ function blockAddress(address) external
❌ function banWallet(address) external
❌ function setBot(address, bool) external
❌ function setSellFee(uint256) external
❌ function setBuyFee(uint256) external
❌ function setFees(uint256, uint256) external
❌ function setMaxTxAmount(uint256) external  // if owner-adjustable after deploy
❌ function setMaxWallet(uint256) external
❌ function destroy() external
❌ function selfdestruct(...) // in any form
❌ function reclaimOwnership() external
❌ function recoverOwnership() external
❌ function setBalance(address, uint256) external
❌ function setPersonalFee(address, uint256) external
❌ function addToWhitelist(address) external
❌ function removeFromWhitelist(address) external
```

### Prohibited Opcodes / Keywords

```solidity
❌ selfdestruct(...)       // Any use
❌ delegatecall(...)       // Unless in a fully governed proxy with Timelock
❌ tx.origin               // For authentication — use msg.sender
```

### Prohibited Patterns in `_transfer()`

```solidity
// ❌ Any of these inside _transfer() or _beforeTokenTransfer() or _afterTokenTransfer():
require(!paused, ...);
require(tradingEnabled, ...);
require(!isBlacklisted[from], ...);
require(!isBlacklisted[to], ...);
require(amount <= maxTxAmount, ...);
require(balanceOf(to) + amount <= maxWallet, ...);
require(block.timestamp >= lastSell[from] + cooldown, ...);
require(block.timestamp >= purchaseTime[from] + earlyPeriod, ...);
uint256 fee = amount * taxRate / 100;  // Any fee deduction
_swapAndLiquify(...);                  // Auto-liquidity
IExternalContract(addr).notify(...);   // External call
```

---

## 6. Allowed Alternatives for Every Deleted Feature

Every feature removed to eliminate flags has a safe alternative that achieves the same business goal without triggering any scanner.

| Deleted Feature | Safe Alternative | Where It Lives |
|---|---|---|
| **ownerMint** | Mint 100% in constructor, distribute via Vesting contracts | Constructor only |
| **Pausable / transfer freeze** | Emergency controls in the DEX frontend or off-chain compliance | Application layer |
| **Blacklist** | KYC, off-chain compliance, application-level address blocking | Off-chain / Frontend |
| **Sell tax** | Revenue from protocol fees, treasury diversification, staking | Protocol layer |
| **Early sell fee** | Vesting contracts with cliff periods for team/investor allocations | Vesting contracts |
| **Auto-liquidity fee** | Gnosis Safe treasury manually adding liquidity on a published schedule | Governance process |
| **Max wallet limit** | Vesting with linear unlock discourages large dumps naturally | Vesting design |
| **Cooldown** | Not needed if Vesting is properly designed | Vesting design |
| **Whitelist** | Remove fees entirely so whitelist exemptions become unnecessary | N/A |
| **Owner balance manipulation** | Transparent Vesting contracts with on-chain verifiable release schedules | Vesting contracts |
| **Selfdestruct** | Not needed for any legitimate token operation — remove entirely | N/A |
| **Single EOA owner** | Gnosis Safe 3-of-5 Multisig | Governance |
| **Instant admin actions** | Timelock (48h standard / 72h critical) | Governance |

---

## Summary: The Developer's Non-Negotiable Checklist

Before submitting for audit or deploying to mainnet, every item below must be verifiable:

```
□ No mint() function exists anywhere in the deployed bytecode
□ No pause() or transfer freeze mechanism of any kind
□ No blacklist, blocklist, banned, or isBot mapping used in _transfer()
□ Transfer fees = 0% — no sell tax, no buy tax, no transfer tax
□ No early sell fee, time-based fee, or block-based fee of any kind
□ No selfdestruct opcode in any contract in the ecosystem
□ Source code verified 100% on Etherscan immediately after deploy
□ No hidden owner — all admin addresses are publicly traceable on-chain
□ No function can change any user's token balance
□ No function can reclaim ownership after it has been transferred
□ No user can be blocked from selling their full balance
□ No unprotected upgradeable proxy (or Multisig + Timelock fully in place)
□ No TODO, FIXME, HACK, or XXX comments anywhere in the code
□ NatSpec on every public and external function (@notice @param @return)
□ SPDX-License-Identifier in every file
□ Exact Solidity version pinned (not a range)
□ Test coverage ≥ 95% with Hardhat + solidity-coverage
□ No unused variables, no dead code, no unused imports
□ Gnosis Safe (3-of-5 min) as the owner before or at deploy
□ Timelock contract deployed before the token contract
□ 100% of LP tokens locked on Unicrypt for ≥ 12 months
□ No single wallet holds >5% of supply outside Vesting contracts
□ Reentrancy guard on all functions with external calls
□ No tx.origin used for authentication anywhere
```

---

*This document is based on official technical documentation from: GoPlus Labs API, Token Sniffer API Reference, CertiK Audit Methodology, Hacken Smart Contract Audit Standards, DEXTools DEXT Score Documentation, and Chainalysis 2024 Crypto Crime Report.*

*Last updated: 2025 | ME Token Project*
