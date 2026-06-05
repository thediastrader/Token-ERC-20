// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillQuest is ERC721, Ownable {
    enum SubmissionStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    struct Skill {
        string name;
        uint8 tier;
        string metadataURI;
        bool exists;
    }

    struct Submission {
        string evidenceURL;
        SubmissionStatus status;
    }

    uint256 private _nextTokenId;

    mapping(uint256 => Skill) private _skills;
    mapping(address => mapping(uint256 => Submission)) private _submissions;
    mapping(address => mapping(uint256 => uint256)) public skillTokenId;
    mapping(uint256 => string) private _tokenURIs;

    event EvidenceSubmitted(address indexed user, uint256 indexed skillId, string evidenceURL);
    event SkillMinted(address indexed user, uint256 indexed skillId, uint256 tokenId);
    event SubmissionRejected(address indexed user, uint256 indexed skillId);
    event SkillAdded(uint256 indexed skillId, string name, uint8 tier);

    constructor() ERC721("SkillQuest", "SKILL") Ownable(msg.sender) {}

    // ─── Admin functions ──────────────────────────────────────────────────────

    function addSkill(
        uint256 skillId,
        string calldata name,
        uint8 tier,
        string calldata metadataURI
    ) external onlyOwner {
        require(!_skills[skillId].exists, "Skill already exists");
        require(tier >= 1 && tier <= 3, "Invalid tier");
        _skills[skillId] = Skill(name, tier, metadataURI, true);
        emit SkillAdded(skillId, name, tier);
    }

    function approveAndMint(address to, uint256 skillId) external onlyOwner {
        require(_skills[skillId].exists, "Skill does not exist");
        require(!hasSkill(to, skillId), "Already has this skill");
        require(
            _submissions[to][skillId].status == SubmissionStatus.Pending,
            "No pending submission"
        );

        _submissions[to][skillId].status = SubmissionStatus.Approved;

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = _skills[skillId].metadataURI;
        skillTokenId[to][skillId] = tokenId;

        emit SkillMinted(to, skillId, tokenId);
    }

    function rejectSubmission(address user, uint256 skillId) external onlyOwner {
        require(
            _submissions[user][skillId].status == SubmissionStatus.Pending,
            "No pending submission"
        );
        _submissions[user][skillId].status = SubmissionStatus.Rejected;
        emit SubmissionRejected(user, skillId);
    }

    // ─── User functions ───────────────────────────────────────────────────────

    function submitEvidence(uint256 skillId, string calldata evidenceURL) external {
        require(_skills[skillId].exists, "Skill does not exist");
        require(!hasSkill(msg.sender, skillId), "Already earned this skill");
        require(
            _submissions[msg.sender][skillId].status != SubmissionStatus.Pending,
            "Submission already pending"
        );
        _submissions[msg.sender][skillId] = Submission(evidenceURL, SubmissionStatus.Pending);
        emit EvidenceSubmitted(msg.sender, skillId, evidenceURL);
    }

    // ─── View functions ───────────────────────────────────────────────────────

    function hasSkill(address user, uint256 skillId) public view returns (bool) {
        return _submissions[user][skillId].status == SubmissionStatus.Approved;
    }

    function getSkill(uint256 skillId) external view returns (Skill memory) {
        require(_skills[skillId].exists, "Skill does not exist");
        return _skills[skillId];
    }

    function getSubmission(address user, uint256 skillId) external view returns (Submission memory) {
        return _submissions[user][skillId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
}
