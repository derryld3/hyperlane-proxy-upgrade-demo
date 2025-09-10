require("@openzeppelin/hardhat-upgrades");
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
};

module.exports = config;
