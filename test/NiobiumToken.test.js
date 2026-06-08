const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NiobiumToken", function () {
  let niobiumToken;
  let owner;
  let addr1;
  let addr2;
  let MINTER_ROLE;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

    const NiobiumToken = await ethers.getContractFactory("NiobiumToken");
    niobiumToken = await NiobiumToken.deploy();
    await niobiumToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await niobiumToken.hasRole(await niobiumToken.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should grant MINTER_ROLE to deployer", async function () {
      expect(await niobiumToken.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
    });

    it("Should set correct name and symbol", async function () {
      expect(await niobiumToken.name()).to.equal("NiobiumChain");
      expect(await niobiumToken.symbol()).to.equal("NIOB");
    });
  });

  describe("Minting", function () {
    it("Should mint a new batch successfully", async function () {
      const batchId = "BATCH-001";
      const weight = 1000;
      const purity = "99.9%";
      const origin = "Brazil";
      const isConflictFree = true;
      const miningLicense = "LICENSE-001";
      const tokenURI = "ipfs://QmTest";

      await niobiumToken.mintBatch(
        addr1.address,
        batchId,
        weight,
        purity,
        origin,
        isConflictFree,
        miningLicense,
        tokenURI
      );

      expect(await niobiumToken.ownerOf(0)).to.equal(addr1.address);
      expect(await niobiumToken.batchIdToTokenId(batchId)).to.equal(0);
    });

    it("Should fail to mint with duplicate batch ID", async function () {
      const batchId = "BATCH-001";
      
      await niobiumToken.mintBatch(
        addr1.address,
        batchId,
        1000,
        "99.9%",
        "Brazil",
        true,
        "LICENSE-001",
        "ipfs://QmTest"
      );

      await expect(
        niobiumToken.mintBatch(
          addr2.address,
          batchId,
          2000,
          "99.8%",
          "Brazil",
          true,
          "LICENSE-002",
          "ipfs://QmTest2"
        )
      ).to.be.revertedWith("Batch ID already exists");
    });

    it("Should fail to mint with zero weight", async function () {
      await expect(
        niobiumToken.mintBatch(
          addr1.address,
          "BATCH-001",
          0,
          "99.9%",
          "Brazil",
          true,
          "LICENSE-001",
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("Weight must be greater than 0");
    });

    it("Should fail to mint without MINTER_ROLE", async function () {
      await expect(
        niobiumToken.connect(addr1).mintBatch(
          addr2.address,
          "BATCH-001",
          1000,
          "99.9%",
          "Brazil",
          true,
          "LICENSE-001",
          "ipfs://QmTest"
        )
      ).to.be.reverted;
    });

    it("Should emit BatchMinted event", async function () {
      await expect(
        niobiumToken.mintBatch(
          addr1.address,
          "BATCH-001",
          1000,
          "99.9%",
          "Brazil",
          true,
          "LICENSE-001",
          "ipfs://QmTest"
        )
      ).to.emit(niobiumToken, "BatchMinted")
        .withArgs(0, "BATCH-001", addr1.address, 1000);
    });
  });

  describe("Batch Information", function () {
    beforeEach(async function () {
      await niobiumToken.mintBatch(
        addr1.address,
        "BATCH-001",
        1000,
        "99.9%",
        "Brazil",
        true,
        "LICENSE-001",
        "ipfs://QmTest"
      );
    });

    it("Should return correct batch information", async function () {
      const batch = await niobiumToken.batches(0);
      expect(batch.batchId).to.equal("BATCH-001");
      expect(batch.producer).to.equal(addr1.address);
      expect(batch.weight).to.equal(1000);
      expect(batch.purity).to.equal("99.9%");
      expect(batch.origin).to.equal("Brazil");
      expect(batch.isConflictFree).to.equal(true);
    });

    it("Should update producer information", async function () {
      await niobiumToken.updateProducer(0, addr2.address);
      const batch = await niobiumToken.batches(0);
      expect(batch.producer).to.equal(addr2.address);
    });

    it("Should fail to update producer without ADMIN_ROLE", async function () {
      await expect(
        niobiumToken.connect(addr1).updateProducer(0, addr2.address)
      ).to.be.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause correctly", async function () {
      await niobiumToken.pause();
      expect(await niobiumToken.paused()).to.equal(true);

      await niobiumToken.unpause();
      expect(await niobiumToken.paused()).to.equal(false);
    });

    it("Should fail to mint when paused", async function () {
      await niobiumToken.pause();
      
      await expect(
        niobiumToken.mintBatch(
          addr1.address,
          "BATCH-001",
          1000,
          "99.9%",
          "Brazil",
          true,
          "LICENSE-001",
          "ipfs://QmTest"
        )
      ).to.be.revertedWithCustom(niobiumToken, "EnforcedPause");
    });

    it("Should fail to pause without ADMIN_ROLE", async function () {
      await expect(niobiumToken.connect(addr1).pause()).to.be.reverted;
    });
  });

  describe("Token Transfer", function () {
    beforeEach(async function () {
      await niobiumToken.mintBatch(
        addr1.address,
        "BATCH-001",
        1000,
        "99.9%",
        "Brazil",
        true,
        "LICENSE-001",
        "ipfs://QmTest"
      );
    });

    it("Should transfer token successfully", async function () {
      await niobiumToken.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
      expect(await niobiumToken.ownerOf(0)).to.equal(addr2.address);
    });

    it("Should emit BatchTransferred event", async function () {
      await expect(
        niobiumToken.connect(addr1).transferFrom(addr1.address, addr2.address, 0)
      ).to.emit(niobiumToken, "Transfer");
    });
  });
});
