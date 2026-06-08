const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   NiobiumChain - Deploy Automatizado de Contratos          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      `Nenhuma conta disponível na rede "${hre.network.name}". ` +
      "Verifique se PRIVATE_KEY no .env é uma chave privada válida de 64 caracteres hexadecimais " +
      "(não o endereço da carteira)."
    );
  }
  console.log("📋 Deployer:", deployer.address);
  console.log("💰 Saldo:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("🌐 Rede:", hre.network.name);
  console.log("");

  // Confirm deployment
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const confirm = await new Promise((resolve) => {
    rl.question("⚠️  Deseja continuar com o deploy? (y/n): ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });

  if (!confirm) {
    console.log("❌ Deploy cancelado.");
    process.exit(0);
  }

  console.log("\n🚀 Iniciando deploy dos contratos...\n");

  const deployedAddresses = {};
  const deploymentOrder = [];

  try {
    // === CORE CONTRACTS ===
    console.log("📦 [1/4] Deploying Core Contracts...");
    
    // SupplyChain
    console.log("   → SupplyChain...");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();
    const supplyChainAddress = await supplyChain.getAddress();
    deployedAddresses.SupplyChain = supplyChainAddress;
    deploymentOrder.push({ name: "SupplyChain", address: supplyChainAddress });
    console.log("   ✓ SupplyChain:", supplyChainAddress);

    // NiobiumDID
    console.log("   → NiobiumDID...");
    const NiobiumDID = await hre.ethers.getContractFactory("NiobiumDID");
    const niobiumDID = await NiobiumDID.deploy();
    await niobiumDID.waitForDeployment();
    const niobiumDIDAddress = await niobiumDID.getAddress();
    deployedAddresses.NiobiumDID = niobiumDIDAddress;
    deploymentOrder.push({ name: "NiobiumDID", address: niobiumDIDAddress });
    console.log("   ✓ NiobiumDID:", niobiumDIDAddress);

    // QRCodeSystem
    console.log("   → QRCodeSystem...");
    const QRCodeSystem = await hre.ethers.getContractFactory("QRCodeSystem");
    const qrCodeSystem = await QRCodeSystem.deploy();
    await qrCodeSystem.waitForDeployment();
    const qrCodeSystemAddress = await qrCodeSystem.getAddress();
    deployedAddresses.QRCodeSystem = qrCodeSystemAddress;
    deploymentOrder.push({ name: "QRCodeSystem", address: qrCodeSystemAddress });
    console.log("   ✓ QRCodeSystem:", qrCodeSystemAddress);

    // CVOracle
    console.log("   → CVOracle...");
    const CVOracle = await hre.ethers.getContractFactory("CVOracle");
    const cvOracle = await CVOracle.deploy();
    await cvOracle.waitForDeployment();
    const cvOracleAddress = await cvOracle.getAddress();
    deployedAddresses.CVOracle = cvOracleAddress;
    deploymentOrder.push({ name: "CVOracle", address: cvOracleAddress });
    console.log("   ✓ CVOracle:", cvOracleAddress);

    console.log("\n📦 [2/4] Deploying Step Contracts...");

    // MiningStep
    console.log("   → MiningStep...");
    const MiningStep = await hre.ethers.getContractFactory("MiningStep");
    const miningStep = await MiningStep.deploy(supplyChainAddress);
    await miningStep.waitForDeployment();
    const miningStepAddress = await miningStep.getAddress();
    deployedAddresses.MiningStep = miningStepAddress;
    deploymentOrder.push({ name: "MiningStep", address: miningStepAddress });
    console.log("   ✓ MiningStep:", miningStepAddress);

    // TransportStep
    console.log("   → TransportStep...");
    const TransportStep = await hre.ethers.getContractFactory("TransportStep");
    const transportStep = await TransportStep.deploy(supplyChainAddress);
    await transportStep.waitForDeployment();
    const transportStepAddress = await transportStep.getAddress();
    deployedAddresses.TransportStep = transportStepAddress;
    deploymentOrder.push({ name: "TransportStep", address: transportStepAddress });
    console.log("   ✓ TransportStep:", transportStepAddress);

    // ProcessingStep
    console.log("   → ProcessingStep...");
    const ProcessingStep = await hre.ethers.getContractFactory("ProcessingStep");
    const processingStep = await ProcessingStep.deploy(supplyChainAddress);
    await processingStep.waitForDeployment();
    const processingStepAddress = await processingStep.getAddress();
    deployedAddresses.ProcessingStep = processingStepAddress;
    deploymentOrder.push({ name: "ProcessingStep", address: processingStepAddress });
    console.log("   ✓ ProcessingStep:", processingStepAddress);

    // PackagingStep
    console.log("   → PackagingStep...");
    const PackagingStep = await hre.ethers.getContractFactory("PackagingStep");
    const packagingStep = await PackagingStep.deploy(supplyChainAddress);
    await packagingStep.waitForDeployment();
    const packagingStepAddress = await packagingStep.getAddress();
    deployedAddresses.PackagingStep = packagingStepAddress;
    deploymentOrder.push({ name: "PackagingStep", address: packagingStepAddress });
    console.log("   ✓ PackagingStep:", packagingStepAddress);

    // PortStep
    console.log("   → PortStep...");
    const PortStep = await hre.ethers.getContractFactory("PortStep");
    const portStep = await PortStep.deploy(supplyChainAddress);
    await portStep.waitForDeployment();
    const portStepAddress = await portStep.getAddress();
    deployedAddresses.PortStep = portStepAddress;
    deploymentOrder.push({ name: "PortStep", address: portStepAddress });
    console.log("   ✓ PortStep:", portStepAddress);

    console.log("\n📦 [3/4] Deploying Tracking Contracts...");

    // BatteryTracking
    console.log("   → BatteryTracking...");
    const BatteryTracking = await hre.ethers.getContractFactory("BatteryTracking");
    const batteryTracking = await BatteryTracking.deploy();
    await batteryTracking.waitForDeployment();
    const batteryTrackingAddress = await batteryTracking.getAddress();
    deployedAddresses.BatteryTracking = batteryTrackingAddress;
    deploymentOrder.push({ name: "BatteryTracking", address: batteryTrackingAddress });
    console.log("   ✓ BatteryTracking:", batteryTrackingAddress);

    // VehicleTracking
    console.log("   → VehicleTracking...");
    const VehicleTracking = await hre.ethers.getContractFactory("VehicleTracking");
    const vehicleTracking = await VehicleTracking.deploy();
    await vehicleTracking.waitForDeployment();
    const vehicleTrackingAddress = await vehicleTracking.getAddress();
    deployedAddresses.VehicleTracking = vehicleTrackingAddress;
    deploymentOrder.push({ name: "VehicleTracking", address: vehicleTrackingAddress });
    console.log("   ✓ VehicleTracking:", vehicleTrackingAddress);

    console.log("\n📦 [4/4] Deploying Legacy Contracts...");

    // NiobiumToken
    console.log("   → NiobiumToken...");
    const NiobiumToken = await hre.ethers.getContractFactory("NiobiumToken");
    const niobiumToken = await NiobiumToken.deploy();
    await niobiumToken.waitForDeployment();
    const niobiumTokenAddress = await niobiumToken.getAddress();
    deployedAddresses.NiobiumToken = niobiumTokenAddress;
    deploymentOrder.push({ name: "NiobiumToken", address: niobiumTokenAddress });
    console.log("   ✓ NiobiumToken:", niobiumTokenAddress);

    // CarbonCredit
    console.log("   → CarbonCredit...");
    const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
    const carbonCredit = await CarbonCredit.deploy();
    await carbonCredit.waitForDeployment();
    const carbonCreditAddress = await carbonCredit.getAddress();
    deployedAddresses.CarbonCredit = carbonCreditAddress;
    deploymentOrder.push({ name: "CarbonCredit", address: carbonCreditAddress });
    console.log("   ✓ CarbonCredit:", carbonCreditAddress);

    // BatteryPassport
    console.log("   → BatteryPassport...");
    const BatteryPassport = await hre.ethers.getContractFactory("BatteryPassport");
    const batteryPassport = await BatteryPassport.deploy();
    await batteryPassport.waitForDeployment();
    const batteryPassportAddress = await batteryPassport.getAddress();
    deployedAddresses.BatteryPassport = batteryPassportAddress;
    deploymentOrder.push({ name: "BatteryPassport", address: batteryPassportAddress });
    console.log("   ✓ BatteryPassport:", batteryPassportAddress);

    console.log("\n✅ Todos os contratos deployados com sucesso!\n");

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedAddresses,
      deploymentOrder: deploymentOrder
    };

    // Save to deployments directory
    const deploymentsDir = "./deployments";
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }
    fs.writeFileSync(
      `${deploymentsDir}/${hre.network.name}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("📁 Deployment info salvo em:", `${deploymentsDir}/${hre.network.name}.json`);

    // Update backend .env
    console.log("\n📝 Atualizando arquivos de configuração...");
    
    const envPath = "./.env";
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    const envUpdates = {
      SUPPLY_CHAIN_ADDRESS: deployedAddresses.SupplyChain,
      NIOBIUM_DID_ADDRESS: deployedAddresses.NiobiumDID,
      QR_CODE_SYSTEM_ADDRESS: deployedAddresses.QRCodeSystem,
      CV_ORACLE_ADDRESS: deployedAddresses.CVOracle,
      MINING_STEP_ADDRESS: deployedAddresses.MiningStep,
      TRANSPORT_STEP_ADDRESS: deployedAddresses.TransportStep,
      PROCESSING_STEP_ADDRESS: deployedAddresses.ProcessingStep,
      PACKAGING_STEP_ADDRESS: deployedAddresses.PackagingStep,
      PORT_STEP_ADDRESS: deployedAddresses.PortStep,
      BATTERY_TRACKING_ADDRESS: deployedAddresses.BatteryTracking,
      VEHICLE_TRACKING_ADDRESS: deployedAddresses.VehicleTracking,
      NIOBIUM_TOKEN_ADDRESS: deployedAddresses.NiobiumToken,
      CARBON_CREDIT_ADDRESS: deployedAddresses.CarbonCredit,
      BATTERY_PASSPORT_ADDRESS: deployedAddresses.BatteryPassport,
    };

    for (const [key, value] of Object.entries(envUpdates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    fs.writeFileSync(envPath, envContent);
    console.log("   ✓ .env atualizado");

    // Update frontend .env
    const frontendEnvPath = "./frontend/.env";
    let frontendEnvContent = "";
    if (fs.existsSync(frontendEnvPath)) {
      frontendEnvContent = fs.readFileSync(frontendEnvPath, "utf8");
    }

    const frontendEnvUpdates = {
      VITE_SUPPLY_CHAIN_ADDRESS: deployedAddresses.SupplyChain,
      VITE_NIOBIUM_DID_ADDRESS: deployedAddresses.NiobiumDID,
      VITE_BATTERY_TRACKING_ADDRESS: deployedAddresses.BatteryTracking,
      VITE_VEHICLE_TRACKING_ADDRESS: deployedAddresses.VehicleTracking,
    };

    for (const [key, value] of Object.entries(frontendEnvUpdates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (frontendEnvContent.match(regex)) {
        frontendEnvContent = frontendEnvContent.replace(regex, `${key}=${value}`);
      } else {
        frontendEnvContent += `\n${key}=${value}`;
      }
    }

    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log("   ✓ frontend/.env atualizado");

    // Update frontend contracts.ts
    const contractsTsPath = "./frontend/src/lib/contracts.ts";
    if (fs.existsSync(contractsTsPath)) {
      let contractsContent = fs.readFileSync(contractsTsPath, "utf8");
      
      contractsContent = contractsContent.replace(
        /VITE_SUPPLY_CHAIN_ADDRESS[^}]+/,
        `VITE_SUPPLY_CHAIN_ADDRESS || '${deployedAddresses.SupplyChain}'`
      );
      contractsContent = contractsContent.replace(
        /VITE_NIOBIUM_DID_ADDRESS[^}]+/,
        `VITE_NIOBIUM_DID_ADDRESS || '${deployedAddresses.NiobiumDID}'`
      );
      contractsContent = contractsContent.replace(
        /VITE_BATTERY_TRACKING_ADDRESS[^}]+/,
        `VITE_BATTERY_TRACKING_ADDRESS || '${deployedAddresses.BatteryTracking}'`
      );
      contractsContent = contractsContent.replace(
        /VITE_VEHICLE_TRACKING_ADDRESS[^}]+/,
        `VITE_VEHICLE_TRACKING_ADDRESS || '${deployedAddresses.VehicleTracking}'`
      );

      fs.writeFileSync(contractsTsPath, contractsContent);
      console.log("   ✓ frontend/src/lib/contracts.ts atualizado");
    }

    // Update GitHub secrets guide
    console.log("\n📋 Summary for GitHub Secrets:");
    console.log("   Adicione estes secrets no GitHub (Settings → Secrets and variables → Actions):");
    console.log("");
    for (const [key, value] of Object.entries(frontendEnvUpdates)) {
      console.log(`   ${key}=${value}`);
    }

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║   ✅ Deploy concluído com sucesso!                         ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("📊 Deploy Summary:");
    console.log("   Rede:", hre.network.name);
    console.log("   Deployer:", deployer.address);
    console.log("   Contratos:", Object.keys(deployedAddresses).length);
    console.log("");
    console.log("📁 Arquivos atualizados:");
    console.log("   - deployments/" + hre.network.name + ".json");
    console.log("   - .env");
    console.log("   - frontend/.env");
    console.log("   - frontend/src/lib/contracts.ts");
    console.log("");
    console.log("🔗 Próximos passos:");
    console.log("   1. Verifique os contratos no Etherscan");
    console.log("   2. Configure os secrets no GitHub");
    console.log("   3. Atualize o frontend se necessário");
    console.log("   4. Teste a integração");

  } catch (error) {
    console.error("\n❌ Erro durante o deploy:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
