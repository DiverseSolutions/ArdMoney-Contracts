import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  paths: {
    sources: "./contracts",
    artifacts: "./build",
  },
  solidity: {
    version: "0.6.12",
    settings: {
      outputSelection: {
        "*": {
          "*": [
            "evm.bytecode.object",
            "evm.deployedBytecode.object",
            "abi",
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.sourceMap",
            "metadata",
          ],
          "": ["ast"],
        },
      },
      evmVersion: "istanbul",
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
  networks: {
    bsc: {
      url: process.env.BSC_URL,
      chainId: 56,
      accounts: {
        mnemonic : process.env.MNEMONIC,
      }
    },
    mumbai: {
      url: process.env.MUMBAI_TESTNET_URL,
      chainId: 80001,
      accounts: {
        mnemonic : process.env.MNEMONIC,
      }
    },
    bscTestNet: {
      url: process.env.BSC_TESTNET_URL,
      chainId: 97,
      accounts: {
        mnemonic : process.env.MNEMONIC,
      }
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
