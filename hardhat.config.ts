import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    base: {
      url: "https://rpc.ankr.com/base",
    },
    hardhat: {
      forking: {
        url: "https://rpc.ankr.com/eth_holesky",
      },
    },
    holesky: {
      url: "https://rpc.ankr.com/eth_holesky",
      accounts: [process.env.ACCOUNT!],
    },
  },
  etherscan: {
    apiKey: "1T92MWKCY78FNFX87ZHBCC37FNCQ8GWD1R",
  },

  sourcify: {
    enabled: true,
  },
};

export default config;
