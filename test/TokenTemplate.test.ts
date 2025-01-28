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
      const claimAmount = 1_000;

      // Encode the claim data and hash it
      // const abi = new AbiCoder();
      // const messageHash = keccak256(
      //   abi.encode(
      //     ["address", "address", "uint256"],
      //     [user.address, tokenAddress, claimAmount]
      //   )
      // );

      const messageHash = await simpleVault.getMessageHash(
        user.address,
        tokenAddress,
        claimAmount
      );

      // Sign the message with the signer's private key, ****most important****
      const signature = await signer.signMessage(ethers.toBeArray(messageHash));
      // recover _messageHash from signature using signer offchain

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
      expect(vaultBalance).to.equal(9_000);
    });

    // it("Should reject a claim with an invalid signature", async function () {
    //   const { simpleVault, testToken, user } = await loadFixture(
    //     deployVaultFixture
    //   );

    //   const tokenAddress = await testToken.getAddress();
    //   const claimAmount = 1_000;

    //   // Fake signature
    //   const invalidSignature = "0x" + "00".repeat(65);
    //   await simpleVault
    //     .connect(user)
    //     .claim(tokenAddress, claimAmount, invalidSignature);

    //   // await expect(
    //   //   simpleVault
    //   //     .connect(user)
    //   //     .claim(tokenAddress, claimAmount, invalidSignature)
    //   // ).to.be.revertedWithCustomError
    // });
    /*
    it("Should reject a claim with insufficient tokens in the vault", async function () {
      const { simpleVault, testToken, signer, user } = await loadFixture(
        deployVaultFixture
      );

      const tokenAddress = await testToken.getAddress();
      const claimAmount = 11_000; // Exceeds the vault balance

      // Encode the claim data and hash it
      const abi = new AbiCoder();
      const messageHash = keccak256(
        abi.encode(
          ["address", "address", "uint256"],
          [user.address, tokenAddress, claimAmount]
        )
      );

      // Create Ethereum signed message hash
      const ethSignedMessageHash = hashMessage(getBytes(messageHash));

      // Sign the message with the signer's private key
      const signature = await signer.signMessage(
        getBytes(ethSignedMessageHash)
      );

      await expect(
        simpleVault.connect(user).claim(tokenAddress, claimAmount, signature)
      ).to.be.revertedWith("Insufficient balance in vault");
    });

    it("Should reject a reused signature", async function () {
      const { simpleVault, testToken, signer, user } = await loadFixture(
        deployVaultFixture
      );

      const tokenAddress = await testToken.getAddress();
      const claimAmount = 1_000;

      // Encode the claim data and hash it
      const abi = new AbiCoder();
      const messageHash = keccak256(
        abi.encode(
          ["address", "address", "uint256"],
          [user.address, tokenAddress, claimAmount]
        )
      );

      // Create Ethereum signed message hash
      const ethSignedMessageHash = hashMessage(getBytes(messageHash));

      // Sign the message with the signer's private key
      const signature = await signer.signMessage(
        getBytes(ethSignedMessageHash)
      );

      // First claim
      await expect(
        simpleVault.connect(user).claim(tokenAddress, claimAmount, signature)
      )
        .to.emit(simpleVault, "Claimed")
        .withArgs(user.address, tokenAddress, claimAmount);

      // Attempt to reuse the signature
      await expect(
        simpleVault.connect(user).claim(tokenAddress, claimAmount, signature)
      ).to.be.revertedWith("Signature already used");
    });*/
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
});
