const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCredit", function () {
  let carbonCredit;
  let owner;
  let addr1;
  let addr2;
  let MINTER_ROLE;
  let AUDITOR_ROLE;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    AUDITOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"));

    const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
    carbonCredit = await CarbonCredit.deploy();
    await carbonCredit.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carbonCredit.hasRole(await carbonCredit.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should grant MINTER_ROLE to deployer", async function () {
      expect(await carbonCredit.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
    });

    it("Should grant AUDITOR_ROLE to deployer", async function () {
      expect(await carbonCredit.hasRole(AUDITOR_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Minting Credits", function () {
    it("Should mint a new credit successfully", async function () {
      const niobiumBatchId = 1;
      const co2Avoided = 100;
      const methodology = "ISO 14064";
      const uri = "ipfs://QmTest";

      await carbonCredit.mintCredit(
        addr1.address,
        niobiumBatchId,
        co2Avoided,
        methodology,
        uri
      );

      expect(await carbonCredit.balanceOf(addr1.address, 0)).to.equal(co2Avoided);
    });

    it("Should fail to mint with zero CO2 avoided", async function () {
      await expect(
        carbonCredit.mintCredit(
          addr1.address,
          1,
          0,
          "ISO 14064",
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("CO2 avoided must be greater than 0");
    });

    it("Should fail to mint without MINTER_ROLE", async function () {
      await expect(
        carbonCredit.connect(addr1).mintCredit(
          addr2.address,
          1,
          100,
          "ISO 14064",
          "ipfs://QmTest"
        )
      ).to.be.reverted;
    });

    it("Should emit CreditMinted event", async function () {
      await expect(
        carbonCredit.mintCredit(
          addr1.address,
          1,
          100,
          "ISO 14064",
          "ipfs://QmTest"
        )
      ).to.emit(carbonCredit, "CreditMinted")
        .withArgs(0, 1, 100, addr1.address);
    });
  });

  describe("Credit Verification", function () {
    beforeEach(async function () {
      await carbonCredit.mintCredit(
        addr1.address,
        1,
        100,
        "ISO 14064",
        "ipfs://QmTest"
      );
    });

    it("Should verify a credit successfully", async function () {
      await carbonCredit.verifyCredit(0);
      const creditData = await carbonCredit.creditData(0);
      expect(creditData.verified).to.equal(true);
      expect(creditData.verifier).to.equal(owner.address);
    });

    it("Should fail to verify without AUDITOR_ROLE", async function () {
      await expect(
        carbonCredit.connect(addr1).verifyCredit(0)
      ).to.be.reverted;
    });

    it("Should fail to verify already verified credit", async function () {
      await carbonCredit.verifyCredit(0);
      await expect(
        carbonCredit.verifyCredit(0)
      ).to.be.revertedWith("Credit already verified");
    });

    it("Should emit CreditVerified event", async function () {
      await expect(
        carbonCredit.verifyCredit(0)
      ).to.emit(carbonCredit, "CreditVerified")
        .withArgs(0, owner.address);
    });
  });

  describe("Credit Retirement", function () {
    beforeEach(async function () {
      await carbonCredit.mintCredit(
        addr1.address,
        1,
        100,
        "ISO 14064",
        "ipfs://QmTest"
      );
      await carbonCredit.verifyCredit(0);
    });

    it("Should retire credits successfully", async function () {
      await carbonCredit.connect(addr1).retireCredit(0, 50);
      expect(await carbonCredit.balanceOf(addr1.address, 0)).to.equal(50);
    });

    it("Should fail to retire without sufficient balance", async function () {
      await expect(
        carbonCredit.connect(addr1).retireCredit(0, 150)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail to retire unverified credit", async function () {
      await carbonCredit.mintCredit(
        addr2.address,
        2,
        100,
        "ISO 14064",
        "ipfs://QmTest2"
      );
      
      await expect(
        carbonCredit.connect(addr2).retireCredit(1, 50)
      ).to.be.revertedWith("Credit must be verified before retirement");
    });

    it("Should emit CreditRetired event", async function () {
      await expect(
        carbonCredit.connect(addr1).retireCredit(0, 50)
      ).to.emit(carbonCredit, "CreditRetired")
        .withArgs(0, 50, addr1.address);
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause correctly", async function () {
      await carbonCredit.pause();
      expect(await carbonCredit.paused()).to.equal(true);

      await carbonCredit.unpause();
      expect(await carbonCredit.paused()).to.equal(false);
    });

    it("Should fail to mint when paused", async function () {
      await carbonCredit.pause();
      
      await expect(
        carbonCredit.mintCredit(
          addr1.address,
          1,
          100,
          "ISO 14064",
          "ipfs://QmTest"
        )
      ).to.be.revertedWithCustom(carbonCredit, "EnforcedPause");
    });

    it("Should fail to retire when paused", async function () {
      await carbonCredit.mintCredit(
        addr1.address,
        1,
        100,
        "ISO 14064",
        "ipfs://QmTest"
      );
      await carbonCredit.verifyCredit(0);
      await carbonCredit.pause();
      
      await expect(
        carbonCredit.connect(addr1).retireCredit(0, 50)
      ).to.be.revertedWithCustom(carbonCredit, "EnforcedPause");
    });
  });

  describe("Batch Operations", function () {
    it("Should handle multiple credit types", async function () {
      await carbonCredit.mintCredit(
        addr1.address,
        1,
        100,
        "ISO 14064",
        "ipfs://QmTest1"
      );
      
      await carbonCredit.mintCredit(
        addr1.address,
        2,
        200,
        "ISO 14064",
        "ipfs://QmTest2"
      );

      expect(await carbonCredit.balanceOf(addr1.address, 0)).to.equal(100);
      expect(await carbonCredit.balanceOf(addr1.address, 1)).to.equal(200);
    });

    it("Should support batch transfer", async function () {
      await carbonCredit.mintCredit(
        addr1.address,
        1,
        100,
        "ISO 14064",
        "ipfs://QmTest"
      );

      await carbonCredit.connect(addr1).safeTransferFrom(
        addr1.address,
        addr2.address,
        0,
        50,
        "0x"
      );

      expect(await carbonCredit.balanceOf(addr1.address, 0)).to.equal(50);
      expect(await carbonCredit.balanceOf(addr2.address, 0)).to.equal(50);
    });
  });
});
