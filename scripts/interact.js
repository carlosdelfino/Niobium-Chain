const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  const deploymentFile = `./deployments/${network}.json`;

  if (!fs.existsSync(deploymentFile)) {
    console.error(`No deployment found for network: ${network}`);
    console.error("Please deploy contracts first using: npx hardhat run scripts/deploy.js");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("Loaded deployment:", deployment);

  const [signer] = await hre.ethers.getSigners();
  console.log("Interacting with account:", signer.address);

  // Get contract instances
  const NiobiumToken = await hre.ethers.getContractFactory("NiobiumToken");
  const niobiumToken = NiobiumToken.attach(deployment.contracts.NiobiumToken);

  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
  const carbonCredit = CarbonCredit.attach(deployment.contracts.CarbonCredit);

  const BatteryPassport = await hre.ethers.getContractFactory("BatteryPassport");
  const batteryPassport = BatteryPassport.attach(deployment.contracts.BatteryPassport);

  // Example interactions
  console.log("\n=== Contract Information ===");
  console.log("NiobiumToken address:", deployment.contracts.NiobiumToken);
  console.log("CarbonCredit address:", deployment.contracts.CarbonCredit);
  console.log("BatteryPassport address:", deployment.contracts.BatteryPassport);

  // Check roles
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  const isMinter = await niobiumToken.hasRole(MINTER_ROLE, signer.address);
  console.log("\nIs MINTER_ROLE on NiobiumToken:", isMinter);

  // Get token count
  const tokenIdCounter = await niobiumToken._tokenIdCounter();
  console.log("Current token ID counter:", tokenIdCounter.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
