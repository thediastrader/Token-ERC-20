import { ethers } from "hardhat";

async function main() {
  const MeuToken = await ethers.getContractFactory("MeuToken");
  const token = await MeuToken.deploy();
  await token.waitForDeployment();
  console.log("MeuToken deployed to:", await token.getAddress());
}

main().catch(console.error);