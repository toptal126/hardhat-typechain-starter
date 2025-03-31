import { ethers } from "hardhat";
import PromptSync from 'prompt-sync';

async function main() {
  const prompt = PromptSync({ sigint: true });

  // Get user input interactively
  const name = prompt('Enter token name: ');
  const symbol = prompt('Enter token symbol: ');
  const totalSupply = prompt('Enter total supply (in tokens, e.g., 1000000 for 1M tokens): ');

  // Convert total supply to wei (18 decimals)
  const totalSupplyWei = ethers.parseEther(totalSupply);

  // Get the contract factory
  const TokenTemplate = await ethers.getContractFactory("TokenTemplate");

  console.log("\nDeploying TokenTemplate with parameters:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", totalSupplyWei.toString());
  console.log("Network:", (await ethers.provider.getNetwork()).name);

  // Deploy the contract
  const token = await TokenTemplate.deploy(name, symbol, totalSupplyWei);

  console.log("\nTokenTemplate deployed to:", await token.getAddress());
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });