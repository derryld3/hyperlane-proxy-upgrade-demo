require("@nomicfoundation/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-verify");
const dotenv = require("dotenv");

dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config = {
  solidity: {
    version: '0.8.22',
    settings: {
      optimizer: {
        enabled: true,
        runs: 999_999,
      },
    },
  },
  networks: {
    seaseed: {
      url: `https://rpc.testnet.pruv.network/`,
      accounts: [PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: {
      'seaseed': 'empty'
    },
    customChains: [
      {
        network: "seaseed",
        chainId: 7336,
        urls: {
          apiURL: "https://explorer.testnet.pruv.network/api",
          browserURL: "https://explorer.testnet.pruv.network"
        }
      }
    ]
  },
};

module.exports = config;
