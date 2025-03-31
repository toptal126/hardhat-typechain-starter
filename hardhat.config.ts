import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    base: {
      url: `https://rpc.ankr.com/base/${process.env.ANKR_API}`,
      accounts: [process.env.ACCOUNT!],
    },
    hardhat: {
      forking: {
        url: `https://rpc.ankr.com/eth_holesky/${process.env.ANKR_API}`,
      },
    },
    holesky: {
      url: `https://rpc.ankr.com/eth_holesky/${process.env.ANKR_API}`,
      accounts: [process.env.ACCOUNT!],
    },
    bscTestnet: {
      url: `https://rpc.ankr.com/bsc_testnet_chapel/${process.env.ANKR_API}`,
      accounts: [process.env.ACCOUNT!],
    },
    bsc: {
      url: `https://rpc.ankr.com/bsc/${process.env.ANKR_API}`,
      accounts: [process.env.ACCOUNT!],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: "1T92MWKCY78FNFX87ZHBCC37FNCQ8GWD1R",
      base: "1T92MWKCY78FNFX87ZHBCC37FNCQ8GWD1R",
      holesky: "1T92MWKCY78FNFX87ZHBCC37FNCQ8GWD1R",
      bscTestnet: "5V3JA6W9PCKE3PJNS8TKUSJHNF73WI6RG4",
      bsc: "5V3JA6W9PCKE3PJNS8TKUSJHNF73WI6RG4",
    },
  },

  sourcify: {
    enabled: true,
  },
};

export default config;
