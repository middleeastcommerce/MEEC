const { expect } = require("chai");
const { ethers } = require("hardhat");

// EIP-712 helpers for ERC20Permit testing
async function getPermitSignature(signer, token, spender, value, deadline) {
  const [name, version, chainId, verifyingContract] = await Promise.all([
    token.name(),
    Promise.resolve("1"),
    signer.provider.getNetwork().then((n) => n.chainId),
    token.getAddress(),
  ]);

  const nonce = await token.nonces(signer.address);

  const domain = { name, version, chainId, verifyingContract };
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const message = { owner: signer.address, spender, value, nonce, deadline };

  const signature = await signer.signTypedData(domain, types, message);
  return ethers.Signature.from(signature);
}

describe("MEECToken", function () {
  const TOTAL_SUPPLY = ethers.parseUnits("1000000", 18); // 1,000,000 tokens

  let token;
  let deployer, alice, bob;

  beforeEach(async function () {
    [deployer, alice, bob] = await ethers.getSigners();

    const MEECToken = await ethers.getContractFactory("MEECToken");
    token = await MEECToken.deploy(deployer.address, TOTAL_SUPPLY);
    await token.waitForDeployment();
  });

  // ─── Deployment ──────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("has the correct name", async function () {
      expect(await token.name()).to.equal("Middle East E-Commerce");
    });

    it("has the correct symbol", async function () {
      expect(await token.symbol()).to.equal("MEEC");
    });

    it("has 18 decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("mints the entire supply to the recipient", async function () {
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await token.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY);
    });

    it("has zero balance for other accounts", async function () {
      expect(await token.balanceOf(alice.address)).to.equal(0n);
    });
  });

  // ─── Transfers ───────────────────────────────────────────────────────────────

  describe("Transfers", function () {
    it("transfers tokens between accounts", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.transfer(alice.address, amount);
      expect(await token.balanceOf(alice.address)).to.equal(amount);
      expect(await token.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY - amount);
    });

    it("emits Transfer event", async function () {
      const amount = ethers.parseUnits("50", 18);
      await expect(token.transfer(alice.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(deployer.address, alice.address, amount);
    });

    it("reverts when sender has insufficient balance", async function () {
      const tooMuch = TOTAL_SUPPLY + 1n;
      await expect(token.transfer(alice.address, tooMuch)).to.be.reverted;
    });

    it("reverts on transfer to zero address", async function () {
      await expect(token.transfer(ethers.ZeroAddress, 1n)).to.be.reverted;
    });
  });

  // ─── Approvals ───────────────────────────────────────────────────────────────

  describe("Approvals", function () {
    it("sets allowance via approve", async function () {
      const amount = ethers.parseUnits("200", 18);
      await token.approve(alice.address, amount);
      expect(await token.allowance(deployer.address, alice.address)).to.equal(amount);
    });

    it("emits Approval event", async function () {
      const amount = ethers.parseUnits("200", 18);
      await expect(token.approve(alice.address, amount))
        .to.emit(token, "Approval")
        .withArgs(deployer.address, alice.address, amount);
    });

    it("transferFrom consumes allowance", async function () {
      const amount = ethers.parseUnits("300", 18);
      await token.approve(alice.address, amount);
      await token.connect(alice).transferFrom(deployer.address, bob.address, amount);
      expect(await token.balanceOf(bob.address)).to.equal(amount);
      expect(await token.allowance(deployer.address, alice.address)).to.equal(0n);
    });

    it("reverts transferFrom when allowance is insufficient", async function () {
      await token.approve(alice.address, 10n);
      await expect(
        token.connect(alice).transferFrom(deployer.address, bob.address, 100n)
      ).to.be.reverted;
    });
  });

  // ─── Burning ─────────────────────────────────────────────────────────────────

  describe("Burning", function () {
    it("allows a holder to burn their own tokens", async function () {
      const burnAmount = ethers.parseUnits("10000", 18);
      await token.burn(burnAmount);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
      expect(await token.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("emits Transfer event to zero address on burn", async function () {
      const burnAmount = ethers.parseUnits("1", 18);
      await expect(token.burn(burnAmount))
        .to.emit(token, "Transfer")
        .withArgs(deployer.address, ethers.ZeroAddress, burnAmount);
    });

    it("allows burnFrom with a valid allowance", async function () {
      const burnAmount = ethers.parseUnits("500", 18);
      await token.approve(alice.address, burnAmount);
      await token.connect(alice).burnFrom(deployer.address, burnAmount);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("reverts burnFrom when allowance is insufficient", async function () {
      await expect(
        token.connect(alice).burnFrom(deployer.address, 1n)
      ).to.be.reverted;
    });

    it("reverts burn when balance is insufficient", async function () {
      const tooMuch = TOTAL_SUPPLY + 1n;
      await expect(token.burn(tooMuch)).to.be.reverted;
    });
  });

  // ─── EIP-2612 Permit ─────────────────────────────────────────────────────────

  describe("Permit (EIP-2612)", function () {
    it("allows gasless approval via off-chain signature", async function () {
      const value = ethers.parseUnits("1000", 18);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      const sig = await getPermitSignature(
        deployer,
        token,
        alice.address,
        value,
        deadline
      );

      await token.permit(
        deployer.address,
        alice.address,
        value,
        deadline,
        sig.v,
        sig.r,
        sig.s
      );

      expect(await token.allowance(deployer.address, alice.address)).to.equal(value);
    });

    it("increments nonce after permit is used", async function () {
      const value = ethers.parseUnits("100", 18);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const nonceBefore = await token.nonces(deployer.address);
      const sig = await getPermitSignature(deployer, token, alice.address, value, deadline);
      await token.permit(deployer.address, alice.address, value, deadline, sig.v, sig.r, sig.s);
      const nonceAfter = await token.nonces(deployer.address);

      expect(nonceAfter).to.equal(nonceBefore + 1n);
    });

    it("reverts permit with expired deadline", async function () {
      const value = ethers.parseUnits("100", 18);
      const expiredDeadline = Math.floor(Date.now() / 1000) - 1; // already past

      const sig = await getPermitSignature(deployer, token, alice.address, value, expiredDeadline);
      await expect(
        token.permit(deployer.address, alice.address, value, expiredDeadline, sig.v, sig.r, sig.s)
      ).to.be.reverted;
    });
  });

  // ─── Immutability (no admin control) ─────────────────────────────────────────

  describe("Immutability", function () {
    it("has no owner() function", function () {
      expect(token.owner).to.be.undefined;
    });

    it("has no mint() function", function () {
      expect(token.mint).to.be.undefined;
    });

    it("has no pause() function", function () {
      expect(token.pause).to.be.undefined;
    });

    it("has no blacklist() function", function () {
      expect(token.blacklist).to.be.undefined;
    });

    it("total supply never increases after deployment", async function () {
      const supplyBefore = await token.totalSupply();
      // The only way supply changes is via burn — let's confirm supply stays same without burn
      await token.transfer(alice.address, 1n);
      expect(await token.totalSupply()).to.equal(supplyBefore);
    });
  });
});
