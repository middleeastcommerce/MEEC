require("dotenv").config();
const hre = require("hardhat");

/**
 * Standalone Etherscan verification script.
 *
 * Usage:
 *   CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify.js --network sepolia
 *
 * Environment variables required:
 *   CONTRACT_ADDRESS  — the deployed contract address
 *   RECIPIENT         — address passed as constructor arg (defaults to deployer)
 */
async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("Set CONTRACT_ADDRESS environment variable to the deployed contract address.");
  }

  let recipient = process.env.RECIPIENT;
  if (!recipient) {
    const [deployer] = await hre.ethers.getSigners();
    recipient = deployer.address;
    console.log("RECIPIENT not set, using deployer address:", recipient);
  }

  console.log("Verifying contract at:", address);
  console.log("  recipient:", recipient);
  console.log("  supply   : 100,000,000,000 MEEC (hardcoded in contract)");

  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [recipient],
  });

  console.log("Verification complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
