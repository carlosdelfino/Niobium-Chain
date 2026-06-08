const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const SupplyChain = await hre.ethers.getContractAt("SupplyChain", "0xa8D4C4a0112E3E97f1EEaa3A5049e863DB384835");
  
  const OPERATOR_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("OPERATOR_ROLE"));
  const newOperator = "0x2427d3bB555334Ca94d6BB99B3E31D3f7Fe259Cb";
  
  await SupplyChain.grantRole(OPERATOR_ROLE, newOperator);
  console.log(`OPERATOR_ROLE concedido para ${newOperator}`);
}

main().catch(console.error);