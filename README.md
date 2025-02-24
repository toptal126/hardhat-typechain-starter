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
npx hardhat verify --network bscTestnet 0x55EdF6bc7AeD655D6B3caA77CFFB4217AEE24546 0x29F7073B286273A68Ea565b47a30818a285e2796
npx hardhat verify --network holesky 0x3BF5aC28f28577540B84C4e8310D99A9910b7C9C 0x29F7073B286273A68Ea565b47a30818a285e2796
```

Deploying

```shell
yarn deploy --network holesky
```
