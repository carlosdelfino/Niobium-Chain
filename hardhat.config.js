require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

// Aceita a chave privada apenas se for um valor hexadecimal de 32 bytes (64 chars),
// com ou sem o prefixo 0x. Caso contrário, retorna lista vazia para não quebrar a config.
function getAccounts() {
  const key = process.env.PRIVATE_KEY;
  if (key && /^(0x)?[0-9a-fA-F]{64}$/.test(key.trim())) {
    return [key.trim().startsWith("0x") ? key.trim() : `0x${key.trim()}`];
  }
  return [];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
      evmVersion: "cancun"
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: getAccounts(),
      chainId: 11155111
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: getAccounts(),
      chainId: 1
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
