require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        optimizer: {
          enabled: true,
          runs: 999999,
        },
      },
    ],
  },
  networks: {
    hardhat:{
    },
    ganache:{
      url: "http://127.0.0.1:7545",
    },
    bsc: {
      url: process.env.BSC_URL,
      chainId: 56,
      accounts: {
        mnemonic : process.env.MNEMONIC,
      }
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_URL,
      chainId: 97,
      accounts: {
        mnemonic : process.env.MNEMONIC,
      }
    },
  },
};
