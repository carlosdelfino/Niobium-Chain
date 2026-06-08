const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BatteryPassport", function () {
  let batteryPassport;
  let owner;
  let addr1;
  let addr2;
  let MANUFACTURER_ROLE;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));

    const BatteryPassport = await ethers.getContractFactory("BatteryPassport");
    batteryPassport = await BatteryPassport.deploy();
    await batteryPassport.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await batteryPassport.hasRole(await batteryPassport.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should grant MANUFACTURER_ROLE to deployer", async function () {
      expect(await batteryPassport.hasRole(MANUFACTURER_ROLE, owner.address)).to.equal(true);
    });

    it("Should set correct name and symbol", async function () {
      expect(await batteryPassport.name()).to.equal("BatteryPassport");
      expect(await batteryPassport.symbol()).to.equal("BATT");
    });
  });

  describe("Passport Creation", function () {
    it("Should create a passport successfully", async function () {
      const serialNumber = "SN-001";
      const model = "Tesla Model 3";
      const capacity = 75;
      const carbonFootprint = 5000;
      const recycledContent = 30;
      const tokenURI = "ipfs://QmTest";

      await batteryPassport.createPassport(
        addr1.address,
        serialNumber,
        model,
        capacity,
        carbonFootprint,
        recycledContent,
        tokenURI
      );

      expect(await batteryPassport.ownerOf(0)).to.equal(addr1.address);
      expect(await batteryPassport.serialToPassportId(serialNumber)).to.equal(0);
    });

    it("Should fail to create with duplicate serial number", async function () {
      const serialNumber = "SN-001";
      
      await batteryPassport.createPassport(
        addr1.address,
        serialNumber,
        "Model A",
        75,
        5000,
        30,
        "ipfs://QmTest"
      );

      await expect(
        batteryPassport.createPassport(
          addr2.address,
          serialNumber,
          "Model B",
          100,
          6000,
            40,
          "ipfs://QmTest2"
        )
      ).to.be.revertedWith("Serial number already exists");
    });

    it("Should fail to create with zero capacity", async function () {
      await expect(
        batteryPassport.createPassport(
          addr1.address,
          "SN-001",
          "Model A",
          0,
          5000,
          30,
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("Capacity must be greater than 0");
    });

    it("Should fail to create with recycled content > 100%", async function () {
      await expect(
        batteryPassport.createPassport(
          addr1.address,
          "SN-001",
          "Model A",
          75,
          5000,
          101,
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("Recycled content must be <= 100%");
    });

    it("Should fail to create without MANUFACTURER_ROLE", async function () {
      await expect(
        batteryPassport.connect(addr1).createPassport(
          addr2.address,
          "SN-001",
          "Model A",
          75,
          5000,
          30,
          "ipfs://QmTest"
        )
      ).to.be.reverted;
    });

    it("Should emit PassportCreated event", async function () {
      await expect(
        batteryPassport.createPassport(
          addr1.address,
          "SN-001",
          "Model A",
          75,
          5000,
          30,
          "ipfs://QmTest"
        )
      ).to.emit(batteryPassport, "PassportCreated")
        .withArgs(0, "SN-001", addr1.address);
    });
  });

  describe("Component Management", function () {
    beforeEach(async function () {
      await batteryPassport.createPassport(
        addr1.address,
        "SN-001",
        "Model A",
        75,
        5000,
        30,
        "ipfs://QmTest"
      );
    });

    it("Should add component successfully", async function () {
      await batteryPassport.addComponent(
        0,
        "Anode",
        1,
        "Supplier A",
        50,
        "Brazil"
      );

      const count = await batteryPassport.getComponentCount(0);
      expect(count).to.equal(1);
    });

    it("Should fail to add component without MANUFACTURER_ROLE", async function () {
      await expect(
        batteryPassport.connect(addr1).addComponent(
          0,
          "Anode",
          1,
          "Supplier A",
          50,
          "Brazil"
        )
      ).to.be.reverted;
    });

    it("Should fail to add component to invalid passport", async function () {
      await expect(
        batteryPassport.addComponent(
          999,
          "Anode",
          1,
          "Supplier A",
          50,
          "Brazil"
        )
      ).to.be.revertedWith("Passport does not exist");
    });

    it("Should fail to add component to invalid passport", async function () {
      await expect(
        batteryPassport.addComponent(
          999,
          "Anode",
          1,
          "Supplier A",
          50,
          "Brazil"
        )
      ).to.be.revertedWith("Passport does not exist");
    });

    it("Should emit ComponentAdded event", async function () {
      await expect(
        batteryPassport.addComponent(
          0,
          "Anode",
          1,
          "Supplier A",
          50,
          "Brazil"
        )
      ).to.emit(batteryPassport, "ComponentAdded")
        .withArgs(0, "Anode", 1);
    });

    it("Should retrieve component correctly", async function () {
      await batteryPassport.addComponent(
        0,
        "Anode",
        1,
        "Supplier A",
        50,
        "Brazil"
      );

      const component = await batteryPassport.getComponent(0, 0);
      expect(component.componentType).to.equal("Anode");
      expect(component.niobiumBatchId).to.equal(1);
      expect(component.supplier).to.equal("Supplier A");
      expect(component.weight).to.equal(50);
      expect(component.origin).to.equal("Brazil");
    });

    it("Should handle multiple components", async function () {
      await batteryPassport.addComponent(0, "Anode", 1, "Supplier A", 50, "Brazil");
      await batteryPassport.addComponent(0, "Cathode", 2, "Supplier B", 60, "China");
      await batteryPassport.addComponent(0, "Electrolyte", 3, "Supplier C", 20, "Germany");

      const count = await batteryPassport.getComponentCount(0);
      expect(count).to.equal(3);
    });
  });

  describe("Passport Invalidation", function () {
    beforeEach(async function () {
      await batteryPassport.createPassport(
        addr1.address,
        "SN-001",
        "Model A",
        75,
        5000,
        30,
        "ipfs://QmTest"
      );
    });

    it("Should invalidate passport successfully", async function () {
      await batteryPassport.invalidatePassport(0);
      const batteryData = await batteryPassport.batteries(0);
      expect(batteryData.isValid).to.equal(false);
    });

    it("Should fail to invalidate without ADMIN_ROLE", async function () {
      await expect(
        batteryPassport.connect(addr1).invalidatePassport(0)
      ).to.be.reverted;
    });

    it("Should fail to invalidate already invalid passport", async function () {
      await batteryPassport.invalidatePassport(0);
      await expect(
        batteryPassport.invalidatePassport(0)
      ).to.be.revertedWith("Passport already invalid");
    });

    it("Should emit PassportInvalidated event", async function () {
      await expect(
        batteryPassport.invalidatePassport(0)
      ).to.emit(batteryPassport, "PassportInvalidated")
        .withArgs(0, owner.address);
    });

    it("Should fail to add component to invalid passport", async function () {
      await batteryPassport.invalidatePassport(0);
      
      await expect(
        batteryPassport.addComponent(
          0,
          "Anode",
          1,
          "Supplier A",
          50,
          "Brazil"
        )
      ).to.be.revertedWith("Passport is invalid");
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause correctly", async function () {
      await batteryPassport.pause();
      expect(await batteryPassport.paused()).to.equal(true);

      await batteryPassport.unpause();
      expect(await batteryPassport.paused()).to.equal(false);
    });

    it("Should fail to create passport when paused", async function () {
      await batteryPassport.pause();
      
      await expect(
        batteryPassport.createPassport(
          addr1.address,
          "SN-001",
          "Model A",
          75,
          5000,
          30,
          "ipfs://QmTest"
        )
      ).to.be.revertedWithCustom(batteryPassport, "EnforcedPause");
    });

    it("Should fail to add component when paused", async function () {
      await batteryPassport.createPassport(
        addr1.address,
        "SN-001",
        "Model A",
        75,
        5000,
        30,
        "ipfs://QmTest"
      );
      await batteryPassport.pause();
      
      await expect(
        batteryPassport.addComponent(
          0,
          "Anode",
          1,
          "Supplier A",
          50,
          "Brazil"
        )
      ).to.be.revertedWithCustom(batteryPassport, "EnforcedPause");
    });
  });

  describe("Battery Information", function () {
    beforeEach(async function () {
      await batteryPassport.createPassport(
        addr1.address,
        "SN-001",
        "Model A",
        75,
        5000,
        30,
        "ipfs://QmTest"
      );
    });

    it("Should return correct battery information", async function () {
      const batteryData = await batteryPassport.batteries(0);
      expect(batteryData.serialNumber).to.equal("SN-001");
      expect(batteryData.manufacturer).to.equal(addr1.address);
      expect(batteryData.model).to.equal("Model A");
      expect(batteryData.capacity).to.equal(75);
      expect(batteryData.carbonFootprint).to.equal(5000);
      expect(batteryData.recycledContent).to.equal(30);
      expect(batteryData.isValid).to.equal(true);
    });
  });
});
