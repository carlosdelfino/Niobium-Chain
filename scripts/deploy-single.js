const hre = require("hardhat");

async function main() {
  const contractName = process.argv[2];
  
  if (!contractName) {
    console.error("Please specify contract name: npx hardhat run scripts/deploy-single.js -- <ContractName>");
    process.exit(1);
  }

  console.log(`Deploying ${contractName}...`);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`${contractName} deployed to:`, contractAddress);

  // Save deployment info
  const fs = require("fs");
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contract: contractName,
    address: contractAddress
  };

  fs.writeFileSync(
    `${deploymentsDir}/${contractName}-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
