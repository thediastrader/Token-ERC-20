import { expect } from "chai";
import { ethers } from "hardhat";
import { SkillQuest } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SkillQuest", function () {
  let contract: SkillQuest;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const SKILL_ID = 1n;
  const SKILL_NAME = "Hello World";
  const SKILL_TIER = 1;
  const SKILL_URI = "ipfs://QmSkillMetadata1";
  const EVIDENCE_URL = "https://github.com/user/hello-world";

  const Status = {
    None: 0n,
    Pending: 1n,
    Approved: 2n,
    Rejected: 3n,
  };

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SkillQuest");
    contract = await Factory.deploy();
  });

  describe("ERC-721 metadata", function () {
    it("has correct name and symbol", async function () {
      expect(await contract.name()).to.equal("SkillQuest");
      expect(await contract.symbol()).to.equal("SKILL");
    });
  });

  describe("addSkill", function () {
    it("allows owner to add a skill and emits SkillAdded", async function () {
      await expect(contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI))
        .to.emit(contract, "SkillAdded")
        .withArgs(SKILL_ID, SKILL_NAME, SKILL_TIER);

      const skill = await contract.getSkill(SKILL_ID);
      expect(skill.name).to.equal(SKILL_NAME);
      expect(skill.tier).to.equal(SKILL_TIER);
      expect(skill.metadataURI).to.equal(SKILL_URI);
    });

    it("reverts when called by non-owner", async function () {
      await expect(
        contract.connect(user1).addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts when skill ID already exists", async function () {
      await contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI);
      await expect(
        contract.addSkill(SKILL_ID, "Duplicate", SKILL_TIER, SKILL_URI)
      ).to.be.revertedWith("Skill already exists");
    });

    it("reverts for tier 0", async function () {
      await expect(
        contract.addSkill(SKILL_ID, SKILL_NAME, 0, SKILL_URI)
      ).to.be.revertedWith("Invalid tier");
    });

    it("reverts for tier 4", async function () {
      await expect(
        contract.addSkill(SKILL_ID, SKILL_NAME, 4, SKILL_URI)
      ).to.be.revertedWith("Invalid tier");
    });

    it("allows tiers 1, 2, and 3", async function () {
      await contract.addSkill(1, "T1", 1, "ipfs://1");
      await contract.addSkill(2, "T2", 2, "ipfs://2");
      await contract.addSkill(3, "T3", 3, "ipfs://3");
      expect((await contract.getSkill(1)).tier).to.equal(1);
      expect((await contract.getSkill(2)).tier).to.equal(2);
      expect((await contract.getSkill(3)).tier).to.equal(3);
    });
  });

  describe("submitEvidence", function () {
    beforeEach(async function () {
      await contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI);
    });

    it("records a pending submission and emits EvidenceSubmitted", async function () {
      await expect(contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL))
        .to.emit(contract, "EvidenceSubmitted")
        .withArgs(user1.address, SKILL_ID, EVIDENCE_URL);

      const sub = await contract.getSubmission(user1.address, SKILL_ID);
      expect(sub.evidenceURL).to.equal(EVIDENCE_URL);
      expect(sub.status).to.equal(Status.Pending);
    });

    it("reverts for a non-existent skill", async function () {
      await expect(
        contract.connect(user1).submitEvidence(99n, EVIDENCE_URL)
      ).to.be.revertedWith("Skill does not exist");
    });

    it("reverts when user already earned the skill", async function () {
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
      await contract.approveAndMint(user1.address, SKILL_ID);
      await expect(
        contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL)
      ).to.be.revertedWith("Already earned this skill");
    });

    it("reverts when submission is already pending", async function () {
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
      await expect(
        contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL)
      ).to.be.revertedWith("Submission already pending");
    });

    it("allows resubmission after rejection", async function () {
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
      await contract.rejectSubmission(user1.address, SKILL_ID);
      await expect(
        contract.connect(user1).submitEvidence(SKILL_ID, "https://github.com/user/better-proof")
      )
        .to.emit(contract, "EvidenceSubmitted")
        .withArgs(user1.address, SKILL_ID, "https://github.com/user/better-proof");
    });

    it("two different users can both submit for the same skill", async function () {
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
      await expect(contract.connect(user2).submitEvidence(SKILL_ID, EVIDENCE_URL)).to.not.be
        .reverted;
    });
  });

  describe("approveAndMint", function () {
    beforeEach(async function () {
      await contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI);
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
    });

    it("mints an NFT, emits SkillMinted, and marks skill as earned", async function () {
      await expect(contract.approveAndMint(user1.address, SKILL_ID))
        .to.emit(contract, "SkillMinted")
        .withArgs(user1.address, SKILL_ID, 0n);

      expect(await contract.balanceOf(user1.address)).to.equal(1n);
      expect(await contract.hasSkill(user1.address, SKILL_ID)).to.be.true;
    });

    it("sets the correct tokenURI from the skill's metadataURI", async function () {
      await contract.approveAndMint(user1.address, SKILL_ID);
      const tokenId = await contract.skillTokenId(user1.address, SKILL_ID);
      expect(await contract.tokenURI(tokenId)).to.equal(SKILL_URI);
    });

    it("increments tokenId for each mint", async function () {
      const SKILL_ID_2 = 2n;
      await contract.addSkill(SKILL_ID_2, "Vibe Coder", 1, "ipfs://skill2");
      await contract.connect(user1).submitEvidence(SKILL_ID_2, EVIDENCE_URL);

      await contract.approveAndMint(user1.address, SKILL_ID);
      await contract.approveAndMint(user1.address, SKILL_ID_2);

      expect(await contract.skillTokenId(user1.address, SKILL_ID)).to.equal(0n);
      expect(await contract.skillTokenId(user1.address, SKILL_ID_2)).to.equal(1n);
    });

    it("reverts when called by non-owner", async function () {
      await expect(
        contract.connect(user1).approveAndMint(user1.address, SKILL_ID)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts when there is no pending submission", async function () {
      await expect(
        contract.approveAndMint(user2.address, SKILL_ID)
      ).to.be.revertedWith("No pending submission");
    });

    it("reverts when user already has the skill", async function () {
      await contract.approveAndMint(user1.address, SKILL_ID);
      await expect(
        contract.approveAndMint(user1.address, SKILL_ID)
      ).to.be.revertedWith("Already has this skill");
    });

    it("reverts for a non-existent skill", async function () {
      await expect(
        contract.approveAndMint(user1.address, 99n)
      ).to.be.revertedWith("Skill does not exist");
    });
  });

  describe("rejectSubmission", function () {
    beforeEach(async function () {
      await contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI);
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
    });

    it("rejects a pending submission and emits SubmissionRejected", async function () {
      await expect(contract.rejectSubmission(user1.address, SKILL_ID))
        .to.emit(contract, "SubmissionRejected")
        .withArgs(user1.address, SKILL_ID);

      const sub = await contract.getSubmission(user1.address, SKILL_ID);
      expect(sub.status).to.equal(Status.Rejected);
    });

    it("reverts when called by non-owner", async function () {
      await expect(
        contract.connect(user1).rejectSubmission(user1.address, SKILL_ID)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts when there is no pending submission", async function () {
      await expect(
        contract.rejectSubmission(user2.address, SKILL_ID)
      ).to.be.revertedWith("No pending submission");
    });

    it("reverts when trying to reject an already approved submission", async function () {
      await contract.approveAndMint(user1.address, SKILL_ID);
      await expect(
        contract.rejectSubmission(user1.address, SKILL_ID)
      ).to.be.revertedWith("No pending submission");
    });
  });

  describe("hasSkill", function () {
    it("returns false before any submission", async function () {
      await contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI);
      expect(await contract.hasSkill(user1.address, SKILL_ID)).to.be.false;
    });

    it("returns false while pending", async function () {
      await contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI);
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
      expect(await contract.hasSkill(user1.address, SKILL_ID)).to.be.false;
    });

    it("returns false after rejection", async function () {
      await contract.addSkill(SKILL_ID, SKILL_NAME, SKILL_TIER, SKILL_URI);
      await contract.connect(user1).submitEvidence(SKILL_ID, EVIDENCE_URL);
      await contract.rejectSubmission(user1.address, SKILL_ID);
      expect(await contract.hasSkill(user1.address, SKILL_ID)).to.be.false;
    });
  });
});
