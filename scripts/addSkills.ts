import { ethers } from "hardhat";

// Replace URIs with your actual IPFS metadata once uploaded.
// Metadata JSON should follow ERC-721 standard:
// { "name": "...", "description": "...", "image": "ipfs://..." }
const SKILLS = [
  // Tier 1 — Iniciante
  { id: 1, name: "Hello World",   tier: 1, uri: "ipfs://bafkreibz4kdtrsqjobbjgza6mfi3eylgn6b74rdaeoj6ozqk5q4tqvsafi" },
  { id: 2, name: "Vibe Coder",    tier: 1, uri: "ipfs://bafkreiaahomt5xgoy6icuqnnfxx6jdv3htkkmpdo6d36and7ef77ld4dya" },
  { id: 3, name: "Documentador",  tier: 1, uri: "ipfs://bafkreielzowbevaeb67mmludqkofrgmbdubyfrumujq7byehamt3ufztlu" },

  // Tier 2 — Construtor
  { id: 4, name: "On-Chain",      tier: 2, uri: "ipfs://bafkreic573hxwbyjok35a642o56gbxhewpbvyslhnilbcquttqdzcexjaq" },
  { id: 5, name: "UI Builder",    tier: 2, uri: "ipfs://bafkreicbttnpajscarcbormyox4z2q2h26dqpnjg2m3t4mocy7nftvt7r4" },
  { id: 6, name: "Integrador",    tier: 2, uri: "ipfs://bafkreifrxssv2n5f5352rkaoexqtuf5sfx6jjaagvdgdtlklop7luz4ytm" },

  // Tier 3 — Criador
  { id: 7, name: "App do Zero",       tier: 3, uri: "ipfs://bafkreihbork62mzzzscy2xzhg7ee2c2mbz4lznehybraqbccltlgjadxya" },
  { id: 8, name: "Builder Público",   tier: 3, uri: "ipfs://bafkreig7kgxlukyvxxykhzy4zbykueuamba36fb5brl2rgsoghapw2372m" },
  { id: 9, name: "Open Source",       tier: 3, uri: "ipfs://bafkreihzlazjxgoqflkbtplkwatxk4mja5tvltca66jbuxlqbtybj67d3a" },
] as const;

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("Set CONTRACT_ADDRESS in .env before running this script");

  const [deployer] = await ethers.getSigners();
  console.log(`Adding skills via: ${deployer.address}`);
  console.log(`Contract:          ${address}\n`);

  const contract = await ethers.getContractAt("SkillQuest", address);

  let added = 0;
  for (const skill of SKILLS) {
    process.stdout.write(`  Skill #${skill.id} — ${skill.name} (Tier ${skill.tier})... `);
    try {
      const tx = await contract.addSkill(skill.id, skill.name, skill.tier, skill.uri);
      await tx.wait();
      console.log("added");
      added++;
    } catch (err: any) {
      const reason: string = err?.reason ?? err?.message ?? "";
      if (reason.includes("Skill already exists")) {
        console.log("already exists, skipping");
      } else {
        throw err;
      }
    }
  }

  console.log(`\nDone — ${added} skill(s) newly added.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
