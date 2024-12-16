import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

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
