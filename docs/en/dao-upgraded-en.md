# What's changing in DAOCommitteeProxy

## Changes to the Contract structure of DAOCommitteProxy

The existing Proxy structure had a problem in that it could only refer to one logic, so the addition of DAO logic was limited. As TON Staking was upgraded to TON StakingV2, functions needed to be added, and the situation arose where existing functions had to be deleted. Therefore, changed the Proxy structure to maintain existing functions while adding new functions, and improved the structure to enable continuous upgrades in the future.

> Original DAO structure
![DAO_Original](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/DAO_Original.jpg)


> Changed DAO structure
![DAO_Changed](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/DAO_Changed.jpg)


## Changes from the existing DAOCommittee

### 1. Added createCandidateAddOn function
In TONStakingV2, a Candidate of Layer2 different from the existing Candidate has been added. When the function is executed, 
a Candidate is created in the CandidateAddOnFactory registered in the DAO. 
You can check the details of the process of registering a new Candidate using the createCandidateAddOn function on the following [Link](https://github.com/tokamak-network/ton-staking-v2/blob/ton-staking-v2/docs/en/ton-staking-v2.md#register-candidateaddon).

### 2. Added setCandidateAddOnFactory function
In TONStakingV2, a candidate from Layer2 that is different from the existing candidate has been added. Accordingly, 
the factory address is set so that the candidate can be added using the corresponding CandidateAddOn function in DAO. 
You can check the details of the CandidateAddOnFactory Contract on the following [Link](https://github.com/tokamak-network/ton-staking-v2/blob/ton-staking-v2/docs/kr/ton-staking-v2.md#candidateaddonfactory).

### 3. Added setLayer2Manager function
When creating a Layer2Candidate using the createCandidateAddOn function, the authority to call the function is limited to only those from Layer2ManagerContract. 
By setting the Layer2Manager address, check whether the call was made from Layer2ManagerContract.

### 4. Added setBurntAmountAtDAO function
Added a function to allow DAO to modify the setBurntAmountAtDAO function of the SeigManager Contract via the Agenda.

### 5. Added setCooldownTime function
found an exploitable point when changeMember is included multiple times in a single transaction. 
To prevent this from being exploited, implemented a cooldownTime period when executing changeMember to ensure that it is executed again.
 
### 6. Added daoExecuteTransaction function
In order to change the current state through DAO Agenda, there is a Minimum Notice and Minimum Voting period, so it takes at least 2 weeks. 
So created this function so that it can be changed immediately in an emergency. 
This function is available in MultiSigWallet. 
You can check the details of MultiSigWallet Contract on the following Link(https://github.com/tokamak-network/tokamak-multisig-wallet).

### 7. Added removeFromBlacklist function
If a DAO Member has more stakes than other Members, it is possible to maliciously remove other Members by calling the retireMember function and then calling the changeMember function. 
To prevent this, when the retireMember function is called, it is registered in the blackList and is prohibited from being used as a DAO Candidate any longer. 
This function is used to remove a Candidate registered in the blacklist from the blacklist.


# Use Case

## For User who want to become a candidate
Here's how you can become a Candidate for the Tokamak DAOCommittee

### Call the createCandidate function
Anyone who wants to become a Candidate can call it. 
The address of the msg.sender that called the function becomes the operator, and in order to perform normal activities as an operator, the operator must deposit more than 1000.1TON in the created Candidate.
![createCandidate](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/createCandidate.jpg)


### Call the createCandidateAddOn function
Anyone who wants to become a Layer2Candidate can call, but only SystemConfig registered in L2Registry can registerCandidateAddOn. 
When registerCandidateAddOn is registered, the operator must deposit more than 1000.1TON at the same time as registration, so that the operator can immediately perform normal activities.
![createCandidateAddOn](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/createCandidateAddOn.jpg)


### Call the registerLayer2CandidateByOwner function
This is the method used when you want to register your own Layer2 as a Candidate of DAO.
If you have your own Layer2, you can make a proposal to the DAO Agenda so that the registerLayer2CandidateByOwner function is executed, and if this proposal passes and the Agenda is executed, the Layer2 will be registered as a Candidate.
After registering as a Candidate, a deposit of 1000.1 TON or more is required to act as a Candidate.
![registerLayer2CandidateByOwner](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/registerLayer2CandidateByOwner.jpg)


## For Candidate of DAOCommittee
Candidates can call the changeMember, setMemoOnCandidate, and setMemoOnCandidateContract functions.

The changeMember function allows you to become a member instead of another member if you have more TON staked than other members.
And you can modify the memo value registered in your Candidate Contract through setMemoOnCandidate and setMemoOnCandidateContract.

![ForCandidate](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/ForCandidate.jpg)



## For everyone
All users can use onApprove, endAgendaVoting, executeAgenda, and updateSeigniorage.

The onApprove function is a function used when creating an Agenda. Users can create an Agenda through TONContract's ApproveAndCall without directly calling the onApprove function.
The endAgendaVoting function is executed when the voting time for the Agenda has ended, and updates the Status and Result status of the Agenda.
The executeAgenda function can be executed when the voting for the Agenda is finished, the Status is WAITING_EXEC, and the Result is ACCEPT. When this function is called, the functions of the passed Agenda are executed.
The updateSeigniorage function is a function that updates the Seigniorage of the Candidate address entered when executing.

![ForEveryone](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/ForEveryone.jpg)


## For Member of DAOCommittee
Members can use the retireMember, castVote, and claimActivityReward functions.

The retireMember function is used when Members retire from the Member role and return to the Candidate role.
The castVote function is used when Members vote on the Agenda. This function allows you to express your opinion for, against, or neutral about the Agenda with a comment.
The claimActivityReward function can be called by current Members and former Candidates. 
Members receive a reward for performing the role, which is determined by the time they spent as a Member and the value of activityRewardPerSecond.
To receive this reward, you must call the claimActivityReward function.

![ForMember](https://github.com/tokamak-network/ton-staking-v2/blob/NewDAOStructure/doc/img/ForMember.jpg)


# Contract Details

## DAOCommittee

- Overview
    - This is a DAO contract that operates on the Tokamak network.
    - The logic consists of DAOCommittee_V1 and DAOCommitteeOwner.
    - The Proxy structure has been changed in consideration of future upgrades.
    - Anyone can become a Candidate.
    - Among the Candidates, those with the most Staking can become Members.
- Authority
    - Owner : The owner is DAOCommitteeContract itself, and can upgrade logic and execute logic through Agenda.
    - DAOContract is the owner of TON, WTON, SeigManager, and DepositManager.
    - Candidate : Anyone can become a Candidate, and once you become a Candidate, you can use the functions that Candidates can use.
    - Member : If there are more TON Stakings than Members among the Candidates, you can change the Member to a Candidate and become a Member. Once you become a Member, you can use the functions that Members can use.
- Storage
    ```
    struct CandidateInfo {
        address candidateContract;
        uint256 indexMembers;
        uint128 memberJoinedTime;
        uint128 rewardPeriod;
        uint128 claimedTimestamp;
    }

    address public ton;
    IDAOVault public daoVault;
    IDAOAgendaManager public agendaManager;
    ICandidateFactory public candidateFactory;
    ILayer2Registry public layer2Registry;
    ISeigManager public seigManager;

    address[] public candidates;
    address[] public members;
    uint256 public maxMember;

    // candidate EOA => candidate information
    mapping(address => CandidateInfo) internal _candidateInfos;
    uint256 public quorum;
    uint256 public activityRewardPerSecond;
    
    address internal _implementation;
    bool public pauseProxy;

    // Migrate. Previous layer information
    mapping(address => CandidateInfo2) internal _oldCandidateInfos;

    struct CandidateInfo2 {
        address candidateContract;
        address newCandidate;
        uint256 indexMembers;
        uint128 memberJoinedTime;
        uint128 rewardPeriod;
        uint128 claimedTimestamp;
    }

    address public wton;
    address public layer2Manager;
    address public candidateAddOnFactory;
    ```



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
export ETH_NODE_URI_MAINNET=${MainnetKey}
export ETH_NODE_URI_GOERLI=${GoerliKey}
export ETH_NODE_URI_sepolia=${SepoliaKey}
export ETHERSCAN_API_KEY=${Etherscan_APIKey}
export INFURA_API_KEY=${Infura_APIKey}
export COINMARKETCAP_API_KEY=${CoinMarketcapKey}
export PRIVATE_KEY=${PrivateKey}
export DEPLOYER=${DeployerKey}
```


## Mainnet Test

change setting hardhat.config.ts 

```
hardhat: {
  forking: {
    // mainnet or sepolia
    url: `${process.env.ETH_NODE_URI_MAINNET}`,
    blockNumber: 20425200
    // url: `${process.env.ETH_NODE_URI_sepolia}`,
    // blockNumber: 6000000
  },
  allowUnlimitedContractSize: true,
  // deploy: ['deploy-migration']
},
```

Test code execution command

```
# Proxy upgraded test
npx hardhat test test/agenda/12.UpgradeDAOProxy-test-mainnet.js

# registerLayer2CandidateByOwner Test
npx hardhat test test/agenda/18.Layer2CandidateTest-mainnet.js
```

## Sepolia Test
change setting hardhat.config.ts 
```
hardhat: {
  forking: {
    // mainnet or sepolia
    // url: `${process.env.ETH_NODE_URI_MAINNET}`,
    // blockNumber: 20425200
    url: `${process.env.ETH_NODE_URI_sepolia}`,
    blockNumber: 6000000
  },
  allowUnlimitedContractSize: true,
  // deploy: ['deploy-migration']
},
```

Test code execution command
```
npx hardhat test test/agenda/13.UpgradeDAOProxy-test-sepolia.js
```