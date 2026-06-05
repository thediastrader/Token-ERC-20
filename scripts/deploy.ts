import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Network:   ${network.name}`);
  console.log(`Deployer:  ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${ethers.formatEther(balance)} ETH\n`);

  const Factory = await ethers.getContractFactory("SkillQuest");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`SkillQuest deployed to: ${address}`);
  console.log(`\nNext step: set CONTRACT_ADDRESS=${address} in .env`);
  console.log(`Then run: npm run add-skills:${network.name === "base" ? "mainnet" : "sepolia"}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
