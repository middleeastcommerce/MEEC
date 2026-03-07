// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title  Middle East E-Commerce (MEEC)
 * @notice Middle East E-Commerce (MEEC) ERC-20 token.
 *
 * Design goals:
 *  - Pass token security scanners (Token Sniffer, GoPlus, DexScreener, Honeypot.is)
 *    with a green / safe rating.
 *  - Zero owner control after deployment: no mint, no pause, no blacklist, no fees.
 *  - All supply is fixed at construction and sent to `recipient`.
 *
 * Extensions included:
 *  - ERC20Permit : gasless approvals via EIP-2612 off-chain signatures
 *
 * Extensions deliberately excluded:
 *  - Ownable / AccessControl : no admin keys
 *  - ERC20Capped / mint      : no post-deployment minting
 *  - ERC20Pausable           : no ability to freeze transfers
 *  - ERC20Burnable           : no token burning of any kind
 *  - Proxy / upgradeable     : contract logic is immutable
 */
contract MEECToken is ERC20, ERC20Permit {

    /// @notice The fixed total supply: 100 Billion MEEC in wei.
    uint256 public constant TOTAL_SUPPLY = 100_000_000_000 * 10 ** 18;

    /// @notice Deploys the MEEC token and mints the entire supply to `recipient`.
    /// @dev    Supply is hardcoded to TOTAL_SUPPLY — it cannot be changed after deployment.
    ///         No mint or burn function exists. The contract has no owner after construction.
    ///         Reverts if `recipient` is the zero address.
    /// @param recipient Address that receives the entire initial supply.
    ///                  Must not be the zero address.
    constructor(address recipient)
        ERC20("Middle East E-Commerce", "MEEC")
        ERC20Permit("Middle East E-Commerce")
    {
        require(recipient != address(0), "MEEC: mint to zero address");
        _mint(recipient, TOTAL_SUPPLY);
    }
}
