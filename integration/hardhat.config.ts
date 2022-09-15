import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";

const privateKey1 = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const privateKey2 = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

const config: HardhatUserConfig = {
  solidity: "0.8.16",
  networks: {
    hardhat: {
    },
    anvil: {
      url: "http://142.93.52.167:8545/",
      accounts: [privateKey1, privateKey2]
    }
  },
};

export default config;
