# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

```shell
npx hardhat verify --network base 0x55EdF6bc7AeD655D6B3caA77CFFB4217AEE24546 'YouAreMyFirst' 'YAMF' 200000000
npx hardhat verify --network base 0x55EdF6bc7AeD655D6B3caA77CFFB4217AEE24546 'YouAreMyFirst' 'YAMF' 200000000000000000000000000
```

Deploying

```shell
yarn deploy --network holesky
```
