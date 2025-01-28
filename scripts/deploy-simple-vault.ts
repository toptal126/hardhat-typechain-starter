import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const [owner] = await ethers.getSigners();
  const SimpleVault = await ethers.getContractFactory("SimpleVault");

  console.log((await ethers.provider.getNetwork()).name);
  //   return;
  // Deploy the contract
  const simpleVault = await SimpleVault.deploy(owner);

  console.log("simpleVault deployed to:", await simpleVault.getAddress());
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
