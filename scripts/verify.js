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
 *   INITIAL_SUPPLY    — same value used during deploy (in wei)
 *   RECIPIENT         — address passed as first constructor arg (defaults to deployer)
 */
async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("Set CONTRACT_ADDRESS environment variable to the deployed contract address.");
  }

  const rawSupply = process.env.INITIAL_SUPPLY || "1000000000000000000000000";
  const totalSupply = BigInt(rawSupply);

  let recipient = process.env.RECIPIENT;
  if (!recipient) {
    const [deployer] = await hre.ethers.getSigners();
    recipient = deployer.address;
    console.log("RECIPIENT not set, using deployer address:", recipient);
  }

  console.log("Verifying contract at:", address);
  console.log("  recipient   :", recipient);
  console.log("  totalSupply :", hre.ethers.formatUnits(totalSupply, 18), "tokens");

  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [recipient, totalSupply],
  });

  console.log("Verification complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
