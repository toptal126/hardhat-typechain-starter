import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
/*
describe("TokenTemplate", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenWithName() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    // get connection
    ethers.provider.getBalance(owner.address).then((balance) => {
      console.log(balance.toString());
    });

    // console.log the balance and address of owner

    const TokenTemplate = await ethers.getContractFactory("TokenTemplate");
    const gotmToken = await TokenTemplate.deploy(
      "GangsOfTheMeta",
      "GOTM",
      1_000_000
    );

    return { gotmToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should match the name, symbol, owner", async function () {
      console.log(await ethers.provider.getBlockNumber());

      const { gotmToken, owner } = await loadFixture(deployTokenWithName);

      expect(await gotmToken.name()).to.equal("GangsOfTheMeta");

      expect(await gotmToken.symbol()).to.equal("GOTM");

      expect(await gotmToken.owner()).to.equal(owner.address);
    });

    it("Should be able to transfer ownership", async function () {
      const { gotmToken, owner, otherAccount } = await loadFixture(
        deployTokenWithName
      );

      expect(await gotmToken.transferOwnership(otherAccount.address))
        .to.emit(gotmToken, "OwnershipTransferred")
        .withArgs(owner.address, otherAccount.address);

      console.log(await gotmToken.owner(), otherAccount.address);

      // test this will be reverted
      await expect(
        gotmToken.transferOwnership(owner.address)
      ).to.be.revertedWithCustomError(gotmToken, "OwnableUnauthorizedAccount");

      await gotmToken.connect(otherAccount).transferOwnership(owner.address);

      expect(await gotmToken.owner()).to.equal(owner.address);
    });
  });
});
*/

import { keccak256, AbiCoder, hashMessage, getBytes } from "ethers";

describe("SimpleVault", function () {
  async function deployVaultFixture() {
    const [owner, signer, user, otherAccount] = await ethers.getSigners();

    // Deploy test ERC20 token
    const TokenTemplate = await ethers.getContractFactory("TokenTemplate");
    const testToken = await TokenTemplate.deploy("TestToken", "TST", 10_000);

    // Deploy SimpleVault with signer address
    const SimpleVault = await ethers.getContractFactory("SimpleVault");
    const simpleVault = await SimpleVault.deploy(signer.address);

    // To exempt a liquidity pair
    // await testToken.updateExemptStatus(liquidityPairAddress, true);

    // To exempt a vault
    await testToken.updateExemptStatus(await simpleVault.getAddress(), true);

    // Transfer some tokens to the vault
    await testToken.transfer(await simpleVault.getAddress(), 10_000);

    return { simpleVault, testToken, owner, signer, user, otherAccount };
  }
  /*
  describe("Deployment", function () {
    it("Should set the correct signer", async function () {
      const { simpleVault, signer } = await loadFixture(deployVaultFixture);
      expect(await simpleVault.signerAddress()).to.equal(signer.address);
    });

    it("Should have tokens in the vault", async function () {
      const { simpleVault, testToken } = await loadFixture(deployVaultFixture);
      const vaultBalance = await testToken.balanceOf(
        await simpleVault.getAddress()
      );
      expect(vaultBalance).to.equal(10_000);
    });
  });*/

  describe("Claim", function () {
    it("Should allow a valid claim", async function () {
      const { simpleVault, testToken, signer, user } = await loadFixture(
        deployVaultFixture
      );

      const tokenAddress = await testToken.getAddress();
      const claimAmount = 100;

      // const testHash = await simpleVault.toEthSignedMessageHash(
      //   "0x6fa8522e46c33fad18b8a59687c3f40dfe6aefd0ed01eca7546ee8f59abe49f33b9f1bdba6f005e405c4ed018130d0d78810f0a057c68202c96a9d83767853511b"
      // );
      // console.log(testHash);
      // Encode the claim data and hash it
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "address", "uint256"],
        [user.address, tokenAddress, claimAmount]
      );

      // Sign the message with the signer's private key, ****most important****
      const signature = await signer.signMessage(ethers.toBeArray(messageHash));
      // recover _messageHash from signature using signer offchain

      console.log("signature", signature.length);
      // User claims tokens
      await expect(
        simpleVault.connect(user).claim(tokenAddress, claimAmount, signature)
      )
        .to.emit(simpleVault, "Claimed")
        .withArgs(user.address, tokenAddress, claimAmount);

      // Verify balances
      const userBalance = await testToken.balanceOf(user.address);
      const vaultBalance = await testToken.balanceOf(
        await simpleVault.getAddress()
      );

      expect(userBalance).to.equal(claimAmount);
      expect(vaultBalance).to.equal(9_900);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow the owner to withdraw tokens", async function () {
      const { simpleVault, testToken, owner } = await loadFixture(
        deployVaultFixture
      );

      const withdrawalAmount = 5_000;

      await expect(
        simpleVault.withdrawToken(
          await testToken.getAddress(),
          withdrawalAmount
        )
      )
        .to.emit(testToken, "Transfer")
        .withArgs(
          await simpleVault.getAddress(),
          owner.address,
          withdrawalAmount
        );

      const ownerBalance = await testToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(withdrawalAmount);
    });
  });

  describe("Max Wallet", function () {
    async function deployTokenFixture() {
      const [owner, user1, user2] = await ethers.getSigners();
      const TokenTemplate = await ethers.getContractFactory("TokenTemplate");
      const token = await TokenTemplate.deploy(
        "TestToken",
        "TST",
        ethers.parseEther("1000000")
      ); // 1M tokens
      return { token, owner, user1, user2 };
    }

    it("Should enforce max wallet limit of 1%", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      const maxTransfer =
        ((await token.totalSupply()) * BigInt(100)) / BigInt(10000); // 1%

      // Transfer exactly 1% should work
      await token.transfer(user1.address, maxTransfer);
      expect(await token.balanceOf(user1.address)).to.equal(maxTransfer);

      // Attempting to transfer more should fail
      await expect(token.transfer(user1.address, 1n)).to.be.revertedWith(
        "Exceeds max wallet limit of 1%"
      );
    });

    it("Should respect exempt status", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      const transferAmount =
        ((await token.totalSupply()) * BigInt(2)) / BigInt(100); // 2%

      // Make user1 exempt
      await token.updateExemptStatus(user1.address, true);
      expect(await token.isExempt(user1.address)).to.be.true;

      // Transfer more than 1% should work for exempt address
      await token.transfer(user1.address, transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should disable max wallet after duration", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      const transferAmount =
        ((await token.totalSupply()) * BigInt(2)) / BigInt(100); // 2%

      // Fast forward past the max wallet deadline (12 hours)
      await ethers.provider.send("evm_increaseTime", [12 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // Transfer more than 1% should work after deadline
      await token.transfer(user1.address, transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should allow owner to disable max wallet", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      const transferAmount =
        ((await token.totalSupply()) * BigInt(2)) / BigInt(100); // 2%

      // Disable max wallet
      await token.disableMaxWallet();
      expect(await token.maxWalletEnabled()).to.be.false;

      // Transfer more than 1% should work
      await token.transfer(user1.address, transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);

      // Should not be able to disable again
      await expect(token.disableMaxWallet()).to.be.revertedWith(
        "Max wallet already disabled"
      );
    });

    it("Should correctly report max wallet active status", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      // Initially active
      expect(await token.isMaxWalletActive()).to.be.true;

      // After disabling
      await token.disableMaxWallet();
      expect(await token.isMaxWalletActive()).to.be.false;

      // Deploy new token and check after duration
      const TokenTemplate = await ethers.getContractFactory("TokenTemplate");
      const newToken = await TokenTemplate.deploy(
        "TestToken2",
        "TST2",
        ethers.parseEther("1000000")
      );

      // Fast forward past deadline
      await ethers.provider.send("evm_increaseTime", [12 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      expect(await newToken.isMaxWalletActive()).to.be.false;
    });
  });
});
