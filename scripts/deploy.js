require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // All tokens go to the deployer address on deployment
  const recipient = deployer.address;

  console.log("Deploying MEECToken — recipient:", recipient, "| supply: 100,000,000,000 MEEC (hardcoded in contract)");

  const MEECToken = await hre.ethers.getContractFactory("MEECToken");
  const token = await MEECToken.deploy(recipient);

  // Wait for deployment transaction to be mined
  await token.waitForDeployment();
  const address = await token.getAddress();
  console.log("MEECToken deployed to:", address);

  // Wait for extra confirmations before attempting Etherscan verification
  // (Etherscan needs time to index the contract)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for 5 block confirmations...");
    const deployTx = token.deploymentTransaction();
    await deployTx.wait(5);

    console.log("Verifying on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [recipient],
      });
      console.log("Verification successful.");
    } catch (err) {
      if (err.message.includes("Already Verified")) {
        console.log("Contract already verified.");
      } else {
        console.error("Verification failed:", err.message);
        console.log(
          "Manual verification command:\n",
          `npx hardhat verify --network ${hre.network.name} ${address} ${recipient}`
        );
      }
    }
  }

  console.log("\nDeployment summary:");
  console.log("  Network  :", hre.network.name);
  console.log("  Address  :", address);
  console.log("  Recipient:", recipient);
  console.log("  Supply   : 100,000,000,000 MEEC (hardcoded in contract)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
