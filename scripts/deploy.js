const hre = require("hardhat");

async function main() {
  console.log("Deploying NiobiumChain Supply Chain contracts...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SupplyChain (core contract)
  console.log("\n=== Core Contracts ===");
  console.log("Deploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", supplyChainAddress);

  // Deploy NiobiumDID
  console.log("\nDeploying NiobiumDID...");
  const NiobiumDID = await hre.ethers.getContractFactory("NiobiumDID");
  const niobiumDID = await NiobiumDID.deploy();
  await niobiumDID.waitForDeployment();
  const niobiumDIDAddress = await niobiumDID.getAddress();
  console.log("NiobiumDID deployed to:", niobiumDIDAddress);

  // Deploy QRCodeSystem
  console.log("\nDeploying QRCodeSystem...");
  const QRCodeSystem = await hre.ethers.getContractFactory("QRCodeSystem");
  const qrCodeSystem = await QRCodeSystem.deploy();
  await qrCodeSystem.waitForDeployment();
  const qrCodeSystemAddress = await qrCodeSystem.getAddress();
  console.log("QRCodeSystem deployed to:", qrCodeSystemAddress);

  // Deploy CVOracle
  console.log("\nDeploying CVOracle...");
  const CVOracle = await hre.ethers.getContractFactory("CVOracle");
  const cvOracle = await CVOracle.deploy();
  await cvOracle.waitForDeployment();
  const cvOracleAddress = await cvOracle.getAddress();
  console.log("CVOracle deployed to:", cvOracleAddress);

  // Deploy Step Contracts (depend on SupplyChain)
  console.log("\n=== Step Contracts ===");
  console.log("Deploying MiningStep...");
  const MiningStep = await hre.ethers.getContractFactory("MiningStep");
  const miningStep = await MiningStep.deploy(supplyChainAddress);
  await miningStep.waitForDeployment();
  const miningStepAddress = await miningStep.getAddress();
  console.log("MiningStep deployed to:", miningStepAddress);

  console.log("\nDeploying TransportStep...");
  const TransportStep = await hre.ethers.getContractFactory("TransportStep");
  const transportStep = await TransportStep.deploy(supplyChainAddress);
  await transportStep.waitForDeployment();
  const transportStepAddress = await transportStep.getAddress();
  console.log("TransportStep deployed to:", transportStepAddress);

  console.log("\nDeploying ProcessingStep...");
  const ProcessingStep = await hre.ethers.getContractFactory("ProcessingStep");
  const processingStep = await ProcessingStep.deploy(supplyChainAddress);
  await processingStep.waitForDeployment();
  const processingStepAddress = await processingStep.getAddress();
  console.log("ProcessingStep deployed to:", processingStepAddress);

  console.log("\nDeploying PackagingStep...");
  const PackagingStep = await hre.ethers.getContractFactory("PackagingStep");
  const packagingStep = await PackagingStep.deploy(supplyChainAddress);
  await packagingStep.waitForDeployment();
  const packagingStepAddress = await packagingStep.getAddress();
  console.log("PackagingStep deployed to:", packagingStepAddress);

  console.log("\nDeploying PortStep...");
  const PortStep = await hre.ethers.getContractFactory("PortStep");
  const portStep = await PortStep.deploy(supplyChainAddress);
  await portStep.waitForDeployment();
  const portStepAddress = await portStep.getAddress();
  console.log("PortStep deployed to:", portStepAddress);

  // Deploy Battery and Vehicle Tracking
  console.log("\n=== Tracking Contracts ===");
  console.log("Deploying BatteryTracking...");
  const BatteryTracking = await hre.ethers.getContractFactory("BatteryTracking");
  const batteryTracking = await BatteryTracking.deploy();
  await batteryTracking.waitForDeployment();
  const batteryTrackingAddress = await batteryTracking.getAddress();
  console.log("BatteryTracking deployed to:", batteryTrackingAddress);

  console.log("\nDeploying VehicleTracking...");
  const VehicleTracking = await hre.ethers.getContractFactory("VehicleTracking");
  const vehicleTracking = await VehicleTracking.deploy();
  await vehicleTracking.waitForDeployment();
  const vehicleTrackingAddress = await vehicleTracking.getAddress();
  console.log("VehicleTracking deployed to:", vehicleTrackingAddress);

  // Deploy Legacy Contracts (backward compatibility)
  console.log("\n=== Legacy Contracts ===");
  console.log("Deploying NiobiumToken...");
  const NiobiumToken = await hre.ethers.getContractFactory("NiobiumToken");
  const niobiumToken = await NiobiumToken.deploy();
  await niobiumToken.waitForDeployment();
  const niobiumTokenAddress = await niobiumToken.getAddress();
  console.log("NiobiumToken deployed to:", niobiumTokenAddress);

  console.log("\nDeploying CarbonCredit...");
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
  const carbonCredit = await CarbonCredit.deploy();
  await carbonCredit.waitForDeployment();
  const carbonCreditAddress = await carbonCredit.getAddress();
  console.log("CarbonCredit deployed to:", carbonCreditAddress);

  console.log("\nDeploying BatteryPassport...");
  const BatteryPassport = await hre.ethers.getContractFactory("BatteryPassport");
  const batteryPassport = await BatteryPassport.deploy();
  await batteryPassport.waitForDeployment();
  const batteryPassportAddress = await batteryPassport.getAddress();
  console.log("BatteryPassport deployed to:", batteryPassportAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      // Core
      SupplyChain: supplyChainAddress,
      NiobiumDID: niobiumDIDAddress,
      QRCodeSystem: qrCodeSystemAddress,
      CVOracle: cvOracleAddress,
      // Steps
      MiningStep: miningStepAddress,
      TransportStep: transportStepAddress,
      ProcessingStep: processingStepAddress,
      PackagingStep: packagingStepAddress,
      PortStep: portStepAddress,
      // Tracking
      BatteryTracking: batteryTrackingAddress,
      VehicleTracking: vehicleTrackingAddress,
      // Legacy
      NiobiumToken: niobiumTokenAddress,
      CarbonCredit: carbonCreditAddress,
      BatteryPassport: batteryPassportAddress
    }
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Write to deployments file
  const fs = require("fs");
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Grant roles to operators");
  console.log("2. Configure step workflows");
  console.log("3. Set up QR Code generators");
  console.log("4. Configure CV Oracle endpoints");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
