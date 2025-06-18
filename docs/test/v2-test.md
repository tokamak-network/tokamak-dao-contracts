# How to Test

## Build
Clone the repository
```
git clone https://github.com/tokamak-network/ton-staking-v2.git
```


Checkout the branch
```
git checkout NewDAOStructure
```

install the repo
```
npm install

npx hardhat compile
```

## Set the environment
setting the env
```
# copy to .env
cp .env.example .env

# open file
vi .env

# ..need to edit and save
INFURA_API_KEY={Infura_APIKey}
ETHERSCAN_API_KEY={Etherscan_APIKey}
COINMARKETCAP_API_KEY={CoinMarketcapKey}

ETH_NODE_URI_MAINNET={MainnetKey}
ETH_NODE_URI_GOERLI={GoerliKey}
ETH_NODE_URI_sepolia={SepoliaKey}

//The PrivateKey below does not matter as long as the value is entered the same way.
ADMIN={AdminKey}
DEPLOYER={DeployerKey}
PRIVATE_KEY={PrivateKey}
DEPLOYER_PRIVATE_KEY={PrivateKey}

SEPOLIA_PRIVATE_KEY={PrivateKey}
AGENDA_KEY={PrivateKey}
```


## Mainnet Test

### Testing before the agenda is created

change setting hardhat.config.ts 

```
forking: {
	url: `${process.env.ETH_NODE_URI_MAINNET}`,
	blockNumber:22355050
},
```

Test code execution command

```
# Integration test of DAO functions before creating agenda
npx hardhat test test/agenda/34.PreDeployIntegrationTest-mainnet.js

```

### Testing after the agenda is created

change setting hardhat.config.ts (This is a test after the 15 agendas were created.)

```
forking: {
	url: `${process.env.ETH_NODE_URI_MAINNET}`,
	blockNumber: 22722692  
},
```

Test code execution command

```
# Integration test of DAO functions before creating agenda
npx hardhat test test/agenda/35.AfterDeployIntegrationTest-mainnet.js 
```

## Sepolia Test
change setting hardhat.config.ts 
```
forking: {
  url: `${process.env.ETH_NODE_URI_sepolia}`,
  blockNumber: 8323710
},
```

Test code execution command

### Tests related to CandidateAddOn feature

```
npx hardhat test test/agenda/28.DAOCandidate-CreateAddOn-sepolia.js
```

### Tests related to currentAgendaView Function

```
npx hardhat test test/agenda/29.currentAgendaViewTest-sepolia.js
```

### Tests related to DAOVault Contract

```
npx hardhat test test/agenda/33.DAOVaultCheckTest-sepolia.js
```
