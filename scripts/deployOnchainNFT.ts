import { ethers } from "hardhat";

async function main() {
  const OnchainNFT = await ethers.getContractFactory("OnchainNFT");
  const nft = await OnchainNFT.deploy();
  await nft.waitForDeployment();
  console.log("OnchainNFT deployed to:", await nft.getAddress());
}

main().catch(console.error);