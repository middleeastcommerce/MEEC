# Middle East E-Commerce (MEEC)

## Whitepaper

Version 1.1  
Status: Draft for publication  
Date: March 25, 2026

## Table of Contents

1. Introduction
2. Market Context
3. Project Overview
4. MEEC Token Overview
5. Utility and Ecosystem Role
6. Tokenomics
7. Technical Design
8. Security Principles
9. Roadmap
10. Team and Operating Presence
11. Risk Disclosure
12. Legal Notice
13. Official Links

## 1. Introduction

Middle East E-Commerce (MEEC) is the native ERC-20 token of the Middle East Commerce ecosystem. The project is centered on building a digital platform that brings together commerce, service discovery, merchant enablement, communication, and future platform-native utility in a single environment.

MEEC is designed as a platform utility token on Ethereum. Its contract follows a simple and restrictive model: fixed supply, no owner privileges, no transfer taxes, no blacklist logic, no post-deployment minting, and no upgradeable proxy pattern. The design objective is to keep token behavior transparent and predictable for users, partners, and external integrators.

This document provides a structured overview of the project, the token model, the contract design, the intended utility of MEEC, and the public references currently associated with the ecosystem.

## 2. Market Context

Digital commerce in regional and cross-border markets often suffers from fragmentation across discovery, communication, payment coordination, merchant tooling, and user experience. Buyers and sellers may interact across multiple disconnected systems, which increases operational friction and reduces trust.

Middle East Commerce is positioned as an ecosystem intended to reduce this fragmentation by combining marketplace activity, merchant services, communication tools, and digital utility into one platform model.

## 3. Project Overview

The project vision is to build a unified commerce infrastructure serving businesses and users across the Middle East and international markets. Based on the current project materials, the ecosystem is intended to support:

- e-commerce transactions
- internal promotional and advertising functions
- merchant subscriptions and platform features
- marketplace services for business and consumer use cases
- multilingual and communication-oriented product features
- future AI-assisted discovery and workflow capabilities

Within this broader environment, MEEC functions as the tokenized utility layer intended to support selected platform interactions.

## 4. MEEC Token Overview

| Item | Value |
|---|---|
| Token Name | Middle East E-Commerce |
| Symbol | MEEC |
| Network | Ethereum |
| Token Standard | ERC-20 |
| Decimals | 18 |
| Total Supply | 100,000,000,000 MEEC |
| Supply Model | Fixed |
| Transfer Tax | 0% |
| Upgradeability | None |
| Admin Control | None in token contract |

### Contract Reference

- Contract address: `0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20`
- Etherscan: `https://etherscan.io/token/0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20`

## 5. Utility and Ecosystem Role

According to the current repository materials, MEEC is intended to support several functional roles inside the Middle East Commerce ecosystem:

- platform payments
- advertising and promotional use cases
- merchant subscriptions
- marketplace service access
- internal feature access and analytics-related functions
- future gaming and digital integrations

The token model is intended to remain operationally simple. Utility is meant to come from integration into the platform rather than from tax mechanics, privileged controls, or hidden transfer conditions.

## 6. Tokenomics

### 6.1 Supply Model

MEEC follows a fixed-supply issuance model:

- Total supply: `100,000,000,000 MEEC`
- Decimals: `18`
- Post-deployment minting: not supported
- Burning: not supported in the token contract

All supply is minted at deployment and transferred to the specified deployment recipient.

### 6.2 Tokenomics Summary

| Metric | Value |
|---|---|
| Total Supply | 100,000,000,000 MEEC |
| Decimals | 18 |
| Minting After Deployment | No |
| Burn Mechanism | No |
| Transfer Tax | 0% |
| Owner-Controlled Functions | None in token contract |
| Liquidity Lock Reference | Yes |
| Vesting Reference | Yes |

The current token model is based on transparency and immutability. The token contract does not contain privileged controls that can alter supply behavior after deployment. This means tokenomics are intended to be governed by the initial supply, public allocations, liquidity arrangements, and vesting structure rather than by ongoing contract-level intervention.

### 6.3 Referenced Allocation Structure

The current project materials reference the following allocation items:

| Allocation | Amount |
|---|---|
| Advertising and Marketing | 10,000,000,000 MEEC |
| Development | 6,000,000,000 MEEC |
| Liquidity | Referenced as locked |

The allocation references above are partial public figures taken from the current repository materials. For a final published whitepaper, the project should present a complete allocation table covering 100% of supply, including any treasury, ecosystem, liquidity, vesting, operational, reserve, or team-controlled allocations if applicable.

Until that final allocation table is published, the confirmed tokenomics points are:

- the total supply is fixed at `100,000,000,000 MEEC`
- no additional tokens can be minted after deployment
- the token contract does not implement burn, tax, pause, or blacklist logic
- project materials reference locked liquidity and a separate vesting structure

### 6.4 Liquidity and Vesting References

The repository materials also reference the following public items:

- Liquidity lock period: `5 years`
- Unlock schedule: `20% yearly`
- Pool address: `0xA8db993220Fa436F8b98c7bc60a894b19dBF3fE3`
- Vesting contract: `0xA98F06312b7614523d0f5e725e15fd20fB1b99F5`
- Vesting release schedule: every 6 months over 5 years
- Referenced lock page: `https://app.uncx.network/lockers/univ2/chain/1/address/0xa8db993220fa436f8b98c7bc60a894b19dbf3fe3/lock/0`

These references help explain the intended distribution controls around liquidity and staged release. However, current holders, reviewers, and exchange partners should verify the latest on-chain status directly through public blockchain records and official project channels.

Based on the project's published allocation references, the vesting release schedule is described as `1.6 billion MEEC` every 6 months over 5 years from pre-allocated vested tokens. According to management guidance reflected in project materials, each 6-month release is intended to be allocated as follows:

- `1,000,000,000 MEEC` for centralized exchange listings
- `400,000,000 MEEC` for marketing and advertising
- `200,000,000 MEEC` for development

These scheduled releases should be understood as allocations from already issued and pre-allocated token reserves under vesting controls, not as new token minting after deployment.

### 6.5 Recommended Final Disclosure Format

For the strongest public-facing version of this whitepaper, the tokenomics section should ultimately be presented in this format:

| Category | Tokens | Percent | Lock / Vesting | Notes |
|---|---|---|---|---|
| Liquidity | TBD | TBD | Locked | Public lock reference |
| Marketing | 10,000,000,000 | 10% | If applicable | As referenced in project materials |
| Development | 6,000,000,000 | 6% | If applicable | As referenced in project materials |
| Additional Categories | TBD | TBD | TBD | Treasury, ecosystem, reserve, team, or other official buckets |

This structure makes review easier because it shows the full token distribution, the percentage of supply per category, and any applicable lock or vesting terms in one place.

## 7. Technical Design

The MEEC token contract is intentionally minimal and built for predictable ERC-20 behavior.

### 7.1 Standards and Libraries

The contract is implemented using OpenZeppelin components and includes:

- `ERC20`
- `ERC20Permit`

This means MEEC supports standard ERC-20 transfers, approvals, allowances, and EIP-2612 permit-based approvals through off-chain signatures.

### 7.2 Fixed Supply Construction

The contract defines a fixed constant total supply:

`TOTAL_SUPPLY = 100,000,000,000 * 10^18`

During deployment, the constructor mints the entire supply to the provided recipient address. Deployment to the zero address is explicitly blocked.

### 7.3 Excluded Contract Capabilities

The contract intentionally excludes features that create administrative risk or reduce transfer neutrality:

- no `Ownable`
- no `AccessControl`
- no `mint`
- no `pause`
- no blacklist or whitelist logic
- no fee-on-transfer mechanism
- no burn extension
- no proxy or upgradeability pattern

This design reduces the privileged attack surface of the token contract and makes token behavior easier to inspect.

## 8. Security Principles

The token design reflects a simple security philosophy:

- immutable token logic
- no administrative account capable of changing token behavior
- no ability to freeze holders or selectively restrict transfers
- no hidden deductions on transfers
- no balance overwrite mechanics

This does not eliminate all risk. Smart contract interaction, liquidity exposure, market risk, and third-party platform dependencies remain relevant. However, the token contract itself is designed to avoid several common centralized control vectors.

## 9. Roadmap

### 2026: Beta Completion and Initial Launch

- finalize the beta phase
- launch the first official platform release
- onboard early strategic partners
- establish initial logistics and payment infrastructure

### 2027: Scaling and Ecosystem Expansion

- strengthen logistics and operational coverage
- introduce AI-assisted recommendation and workflow capabilities
- add real-time communication functions
- expand partnerships and network reach

### 2028: Global Expansion

- extend platform presence across broader international markets
- continue scaling toward a more comprehensive platform model
- strengthen the ecosystem as digital infrastructure for commerce and services

## 10. Team and Operating Presence

The current repository materials list the following project roles.

### Core Team

- Khaled Alshaar, CEO and Project Director
- Layla Tawil, Deputy CEO
- Ibrahim Anjro, Operations Manager
- Waleed Albarghouthi, Manager
- Abdelrhman Abdulaziz, Token Manager and Blockchain Specialist

### Technical and Product Roles

- Mohamad Shaban, Flutter Developer
- Zakaria Zhlat, Front-End Developer
- Bilal Khubieh, Front-End and Systems Developer
- Ahmad Odeh, Back-End Developer
- Saleh Lala, Back-End Developer
- Bilal Mardini, Back-End Developer
- Abdalrahman Alkateb, Back-End Developer
- Mohammd Mdani, Cloud Engineer and DevOps
- Bilal Alshayah, Team Leader and Mobile Application Developer

### Design, QA, and Marketing

- Mohammad Tarek Almosali, UI/UX Designer
- Wedad Joulaq, UI/UX Designer
- Aya Tawil, Graphic Designer
- Weaam Tawil, Designer
- Afaf Tawil, Interior Designer
- Marina Nabil, Content Writer
- Aya Alhomsi, QA Tester
- Khaled Idrees, SEO Specialist and Content Manager
- Omar Rachid, Marketing Specialist

### Referenced Operating Presence

- Headquarters: Sultanate of Oman
- Operational countries referenced in project materials: Lebanon, Germany, Turkey, Jordan, Egypt, Syria

## 11. Risk Disclosure

Participation in digital asset ecosystems involves substantial risk. Relevant risk categories include:

- token price volatility
- liquidity risk
- regulatory and compliance risk
- smart contract risk
- platform adoption risk
- operational execution risk
- dependency on third-party infrastructure and services

Any user, partner, or investor should perform independent technical, financial, and legal due diligence before making decisions based on the token or the broader project.

## 12. Legal Notice

This whitepaper is provided for informational purposes only. It does not constitute investment advice, legal advice, tax advice, or an offer to sell or solicit any security or financial instrument in any jurisdiction.

Any roadmap statements, growth expectations, or future ecosystem plans are forward-looking and subject to change.

## 13. Official Links

- Website: `https://www.middleeastcommerce.net`
- Contract: `0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20`
- Etherscan: `https://etherscan.io/token/0xeD940743AFC221EAb5D0B8c2bC9a47E0664D1A20`
- Contact: `info@middleeastcommerce.net`
