// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MyToken
 * @notice Minimal immutable ERC-20 token.
 *
 * Design goals:
 *  - Pass token security scanners (Token Sniffer, GoPlus, DexScreener, Honeypot.is)
 *    with a green / safe rating.
 *  - Zero owner control after deployment: no mint, no pause, no blacklist, no fees.
 *  - All supply is fixed at construction and sent to `recipient`.
 *
 * Extensions included:
 *  - ERC20Burnable : holders can burn their own tokens (holder-controlled only)
 *  - ERC20Permit   : gasless approvals via EIP-2612 off-chain signatures
 *
 * Extensions deliberately excluded:
 *  - Ownable / AccessControl : no admin keys
 *  - ERC20Capped / mint      : no post-deployment minting
 *  - ERC20Pausable           : no ability to freeze transfers
 *  - Proxy / upgradeable     : contract logic is immutable
 */
contract MyToken is ERC20, ERC20Burnable, ERC20Permit {

    /**
     * @param recipient    Address that receives the entire initial supply.
     *                     Typically the deployer wallet.
     * @param totalSupply_ Total token supply in the smallest unit (wei).
     *                     Example: 1,000,000 tokens → 1_000_000 * 10**18
     */
    constructor(address recipient, uint256 totalSupply_)
        ERC20("My Token", "MTK")
        ERC20Permit("My Token")
    {
        _mint(recipient, totalSupply_);
    }
}
