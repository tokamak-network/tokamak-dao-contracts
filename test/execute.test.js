const {
  defaultSender, accounts, contract, web3,
} = require('@openzeppelin/test-environment');
const {
  BN, constants, expectEvent, expectRevert, time, ether,
} = require('@openzeppelin/test-helpers');

const { padLeft, toBN } = require('web3-utils');
const { marshalString, unmarshalString } = require('./helpers/marshal');

const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');

const chai = require('chai');
const { expect } = chai;
chai.use(require('chai-bn')(BN)).should();

const {
  AGENDA_INDEX_CREATED_TIMESTAMP,
  AGENDA_INDEX_NOTICE_END_TIMESTAMP,
  AGENDA_INDEX_VOTING_PERIOD_IN_SECONDS,
  AGENDA_INDEX_VOTING_STARTED_TIMESTAMP,
  AGENDA_INDEX_VOTING_END_TIMESTAMP,
  AGENDA_INDEX_EXECUTABLE_LIMIT_TIMESTAMP,
  AGENDA_INDEX_EXECUTED_TIMESTAMP,
  AGENDA_INDEX_COUNTING_YES,
  AGENDA_INDEX_COUNTING_NO,
  AGENDA_INDEX_COUNTING_ABSTAIN,
  AGENDA_INDEX_STATUS,
  AGENDA_INDEX_RESULT,
  AGENDA_INDEX_EXECUTED,
  AGENDA_STATUS_NONE,
  AGENDA_STATUS_NOTICE,
  AGENDA_STATUS_VOTING,
  AGENDA_STATUS_WAITING_EXEC,
  AGENDA_STATUS_EXECUTED,
  AGENDA_STATUS_ENDED,
  VOTE_ABSTAIN,
  VOTE_YES,
  VOTE_NO,
  AGENDA_RESULT_PENDING,
  AGENDA_RESULT_ACCEPTED,
  AGENDA_RESULT_REJECTED,
  AGENDA_RESULT_DISMISSED,
  VOTER_INFO_ISVOTER,
  VOTER_INFO_HAS_VOTED,
  VOTER_INFO_VOTE
} = require('../utils/constants.js');

// dao-contracts
const DAOVault = contract.fromArtifact('DAOVault');
const DAOCommittee = contract.fromArtifact('DAOCommittee');
const DAOAgendaManager = contract.fromArtifact('DAOAgendaManager');
const CandidateFactory = contract.fromArtifact('CandidateFactory');
const DAOCommitteeProxy = contract.fromArtifact('DAOCommitteeProxy');
const Candidate = contract.fromArtifact('Candidate');

// plasma-evm-contracts
const TON = contract.fromArtifact('TON');
const WTON = contract.fromArtifact('WTON');
const DepositManager = contract.fromArtifact('DepositManager');
const SeigManager = contract.fromArtifact('SeigManager');
const CoinageFactory = contract.fromArtifact('CoinageFactory');
const Layer2Registry = contract.fromArtifact('Layer2Registry');
const AutoRefactorCoinage = contract.fromArtifact('AutoRefactorCoinage');
const PowerTON = contract.fromArtifact('PowerTON');
const OldDAOVaultMock = contract.fromArtifact('OldDAOVaultMock');

const EtherToken = contract.fromArtifact('EtherToken');
const EpochHandler = contract.fromArtifact('EpochHandler');
const SubmitHandler = contract.fromArtifact('SubmitHandler');
const Layer2 = contract.fromArtifact('Layer2');

let o;
process.on('exit', function () {
  console.log(o);
});

const [ candidate1, candidate2, candidate3, user1, user2, user3, user4,user5,user6,candidate4] = accounts;
const candidates = [candidate1, candidate2, candidate3];
const users = [user1, user2, user3, user4, user5, user6];
const deployer = defaultSender;

const _TON = createCurrency('TON');
const _WTON = createCurrency('WTON');
const _WTON_TON = createCurrencyRatio(_WTON, _TON);

const TON_UNIT = 'wei';
const WTON_UNIT = 'ray';
const WTON_TON_RATIO = _WTON_TON('1');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

/*const CANDIDATE_INFO_INDEX_CANDIDATE_CONTRACT = 0;
const CANDIDATE_INFO_INDEX_MEMBER_JOINED_TIME = 1;
const CANDIDATE_INFO_INDEX_MEMBER_INDEX = 2;
const CANDIDATE_INFO_INDEX_REWARD_PERIOD = 3;

const AGENDA_INDEX_CREATED_TIMESTAMP = 0;
const AGENDA_INDEX_NOTICE_END_TIMESTAMP = 1;
const AGENDA_INDEX_VOTING_PERIOD_IN_SECONDS = 2;
const AGENDA_INDEX_VOTING_STARTED_TIMESTAMP = 3;
const AGENDA_INDEX_VOTING_END_TIMESTAMP = 4;
const AGENDA_INDEX_EXECUTED_TIMESTAMP = 5;
const AGENDA_INDEX_COUNTING_YES = 6;
const AGENDA_INDEX_COUNTING_NO = 7;
const AGENDA_INDEX_COUNTING_ABSTAIN = 8;
const AGENDA_INDEX_STATUS = 9;
const AGENDA_INDEX_RESULT = 10;
//const AGENDA_INDEX_VOTERS = 12;
const AGENDA_INDEX_EXECUTED = 11;

const AGENDA_STATUS_NONE = 0;
const AGENDA_STATUS_NOTICE = 1;
const AGENDA_STATUS_VOTING = 2;
const AGENDA_STATUS_WAITING_EXEC = 3;
const AGENDA_STATUS_EXECUTED = 4;
const AGENDA_STATUS_ENDED = 5;
//const AGENDA_STATUS_PENDING = 6;
//const AGENDA_STATUS_RISK = 7;

const VOTE_ABSTAIN = 0;
const VOTE_YES = 1;
const VOTE_NO = 2;

const AGENDA_RESULT_ACCEPTED = 1;
const AGENDA_RESULT_REJECTED = 2;
const AGENDA_RESULT_DISMISSED = 3;


const VOTER_INFO_ISVOTER = 0;
const VOTER_INFO_HAS_VOTED = 1;
const VOTER_INFO_VOTE = 2;*/

////////////////////////////////////////////////////////////////////////////////
// test settings

const WITHDRAWAL_DELAY = 10;
const SEIG_PER_BLOCK = _WTON('3.92');
const ROUND_DURATION = time.duration.minutes(5);

const TON_INITIAL_SUPPLY = _TON('50000000');
const TON_INITIAL_HOLDERS = _TON('1000000');
const TON_VAULT_AMOUNT = _WTON('10000000');

const POWERTON_SEIG_RATE = _WTON('0.1');
const DAO_SEIG_RATE = _WTON('0.5');
const PSEIG_RATE = _WTON('0.4');

const TON_MINIMUM_STAKE_AMOUNT = _TON('1000');

////////////////////////////////////////////////////////////////////////////////

const owner= defaultSender;
let daoCommitteeProxy;
let daoVault, committeeProxy, committee, activityRewardManager , agendaManager, candidateFactory;
let gasUsedRecords = [];
let gasUsedTotal = 0; 
let debugLog=true;
let tx  ; 
//------------------

let ton;
let wton;
let registry;
let depositManager;
let factory;
let oldDaoVault;
let seigManager;
let powerton;

describe('Test 1', function () {
  beforeEach(async function () {
    this.timeout(1000000);

    /*[
      ton,
      wton,
      registry,
      depositManager,
      coinageFactory,
      oldDaoVault,
      seigManager,
      powerton
    ] = await deployPlasmaEvmContracts(owner);*/

    /*[
      daoVault,
      agendaManager,
      candidateFactory,
      committee,
      committeeProxy
    ] = await deployDaoContracts(owner);*/

    await initializePlasmaEvmContracts(); 
    await initializeDaoContracts();

    await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
    await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));  
  });

  function recordGasUsed(_tx, _label) { 
    if(_tx!=null && _tx.receipt !=null){
        gasUsedTotal += _tx.receipt.gasUsed;
        gasUsedRecords.push(String(_label + ' \| GasUsed: ' + _tx.receipt.gasUsed).padStart(60));
    } 
  }

  function printGasUsed() {
      console.log('------------------------------------------------------------');
      for (let i = 0; i < gasUsedRecords.length; ++i) {
          console.log(gasUsedRecords[i]);
      }
      console.log(String("Total: " + gasUsedTotal).padStart(60));
      console.log('------------------------------------------------------------');
  }

  function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  } 

  function verifyTransaction(tx, creator) {
    //console.log('verifyTransaction tx ', tx ) ;  
    
    for (let l of tx.logs) {
        if (l.event === 'eventAddMember') {
            //console.log('eventAddMember Event Args ', l.args) ;  
            return l.args.sender;
        } 
        if (l.event === 'AgendaCreated') {
          //console.log('AgendaCreated Event Args ', l.args) ;  
          return l.args.id;
        }    
        if (l.event === 'AgendaVoteCasted') {
          //console.log('AgendaCreated Event Args ', l.args) ;  
          return l.args.id;
        }  
        if (l.event === 'AgendaExecuted') {
          //console.log('AgendaCreated Event Args ', l.args) ;  
          return l.args.id;
        } 
        if (l.event === 'ClaimActivityFees') {
          //console.log('AgendaCreated Event Args ', l.args) ;  
          return l.args.amount;
        } 
        if (l.event === 'createLayer') {
        // console.log('createLayer Event Args ', l.args) ;  
          return l.args;
        } 
        if (l.event === 'CommitteeLayer2Created') {
          console.log('CommitteeLayer2Created Event Args ', l.args) ;  
          return l.args;
        }  
    }  
    assert(true, 'Did not find initial Transfer event');
  } 

  function verifyEvent(tx, eventname) {
    //console.log('verifyTransaction tx ', tx ) ;  
    
    for (let l of tx.logs) {
        if (l.event === eventname) { 
            return true;
        }  
    }  
    assert(false, 'Did not find event');
  } 


  async function initializePlasmaEvmContracts() {
    ton = await TON.new();
    this.ton = ton;
    wton = await WTON.new(ton.address);
    registry = await Layer2Registry.new();
    depositManager = await DepositManager.new(
      wton.address,
      registry.address,
      WITHDRAWAL_DELAY,
    );
    factory = await CoinageFactory.new();

    currentTime = await time.latest();
    oldDaoVault = await OldDAOVaultMock.new(wton.address, currentTime);
    seigManager = await SeigManager.new(
      ton.address,
      wton.address,
      registry.address,
      depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      factory.address
    );
    powerton = await PowerTON.new(
      seigManager.address,
      wton.address,
      ROUND_DURATION,
    );
    await powerton.init();

    await seigManager.setPowerTON(powerton.address);
    await powerton.start();
    await seigManager.setDao(oldDaoVault.address);
    await wton.addMinter(seigManager.address);
    await ton.addMinter(wton.address);
    
    await Promise.all([
      depositManager,
      wton,
    ].map(contract => contract.setSeigManager(seigManager.address)));
      
    // ton setting
    await ton.mint(deployer, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));
    await ton.approve(wton.address, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));
     
    seigManager.setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT));
    seigManager.setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT));
    seigManager.setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT));
    await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)));
    await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)));  
    await wton.mint(oldDaoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));

    await seigManager.setMinimumAmount(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT))


  }

  async function initializeDaoContracts() {
    debugLog =false;
    if(debugLog) console.log('ton :', ton.address) ;

    //===================================================
    daoVault = await DAOVault.new(ton.address, wton.address);
    if(debugLog)  console.log('daoVault :', daoVault.address) ;
    //===================================================
    agendaManager = await DAOAgendaManager.new();
    if(debugLog)  console.log('agendaManager :', agendaManager.address) ;
    //===================================================
    candidateFactory = await CandidateFactory.new();
    if(debugLog)  console.log('candidateFactory :', candidateFactory.address) ;
    //===================================================

    committee = await DAOCommittee.new();
    if(debugLog)  console.log('dAOCommittee :', committee.address) ;

    daoCommitteeProxy = await DAOCommitteeProxy.new(
      ton.address,
      committee.address,
      seigManager.address,
      registry.address,
      agendaManager.address,
      candidateFactory.address,
      daoVault.address
    );
    if(debugLog)  console.log('daoCommitteeProxy :', daoCommitteeProxy.address) ;
   
    let impl = await daoCommitteeProxy.implementation() ;

    committeeProxy = await DAOCommittee.at(daoCommitteeProxy.address);
    if(debugLog)  console.log('committeeProxy :', committeeProxy.address ) ;
     
    if(debugLog){
      console.log('dAOCommittee :', committee.address) ;
      console.log('daoCommitteeProxy :', daoCommitteeProxy.address) ;
      console.log('daoCommitteeProxy implementation :', impl) ;
    }
    await committeeProxy.increaseMaxMember(3, 2);

    ////////////////////////////////////////////////////////////////////////
    // test setting
    await committeeProxy.setActivityRewardPerSecond(toBN("1"));
    await agendaManager.setMinimumNoticePeriodSeconds(toBN("10000"));
    await agendaManager.setMinimumVotingPeriodSeconds(toBN("10000"));
    await ton.mint(daoVault.address, toBN("99999999999999999999999999999999999"));
    await wton.mint(daoVault.address, toBN("99999999999999999999999999999999999"));

    ////////////////////////////////////////////////////////////////////////
    // permissions
    await daoVault.approveTON(committeeProxy.address, toBN("9999999999999999999999999999"));
    await daoVault.approveWTON(committeeProxy.address, toBN("9999999999999999999999999999999999999"));

    await ton.addMinter(committeeProxy.address);
    await ton.transferOwnership(committeeProxy.address);

    await wton.addMinter(committeeProxy.address);
    await wton.transferOwnership(committeeProxy.address);

    await seigManager.addPauser(committeeProxy.address);

    await registry.transferOwnership(committeeProxy.address);
    await seigManager.transferOwnership(committeeProxy.address);
    await depositManager.transferOwnership(committeeProxy.address);

    await daoVault.transferOwnership(committeeProxy.address);
    await agendaManager.setCommittee(committeeProxy.address);
    await agendaManager.transferOwnership(committeeProxy.address);
    //await committee.transferOwnership(committeeProxy.address);

    await ton.renounceMinter();
    await wton.renounceMinter();
    await seigManager.renouncePauser();
  } 

  async function deposit(candidateContractAddress, account, tonAmount) {
    const beforeBalance = await ton.balanceOf(account);
    beforeBalance.should.be.bignumber.gte(tonAmount);
    const data = marshalString(
      [depositManager.address, candidateContractAddress]
        .map(unmarshalString)
        .map(str => padLeft(str, 64))
        .join(''),
    );
    await ton.approveAndCall(
      wton.address,
      tonAmount,
      data,
      {from: account}
    );
    const afterBalance = await ton.balanceOf(account);
    beforeBalance.sub(afterBalance).should.be.bignumber.equal(tonAmount);
  }

  async function totalBalanceOfCandidate(candidate) {
    const candidateContractAddress = await committeeProxy.candidateContract(candidate);
    const coinageAddress = await seigManager.coinages(candidateContractAddress);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    return await coinage.totalSupply();
  }

  async function addCandidate(candidate) {
    const minimum = await seigManager.minimumAmount();
    const beforeTonBalance = await ton.balanceOf(candidate);

    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    await committeeProxy.createCandidate(candidate, {from: candidate});

    const candidateContractAddress = await committeeProxy.candidateContract(candidate);

    (await registry.layer2s(candidateContractAddress)).should.be.equal(true);

    await deposit(candidateContractAddress, candidate, stakeAmountTON);

    const afterTonBalance = await ton.balanceOf(candidate);
    beforeTonBalance.sub(afterTonBalance).should.be.bignumber.equal(stakeAmountTON);

    const coinageAddress = await seigManager.coinages(candidateContractAddress);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmount = await coinage.balanceOf(candidate);
    stakedAmount.should.be.bignumber.equal(stakeAmountWTON);

    const candidatesLength = await committeeProxy.candidatesLength();
    let foundCandidate = false;
    for (let i = 0; i < candidatesLength; i++) {
      const address = await committeeProxy.candidates(i);
      if (address === candidate) {
        foundCandidate = true;
        break;
      }
    }
    foundCandidate.should.be.equal(true);
  }

  async function addCandidateWithoutDeposit(candidate) {
    const minimum = await seigManager.minimumAmount();
    const beforeTonBalance = await ton.balanceOf(candidate);

    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    await committeeProxy.createCandidate(candidate, {from: candidate});

    const candidateContractAddress = await committeeProxy.candidateContract(candidate);

    (await registry.layer2s(candidateContractAddress)).should.be.equal(true);
 
    const candidatesLength = await committeeProxy.candidatesLength();
 
    let foundCandidate = false;
    for (let i = 0; i < candidatesLength; i++) {
      const address = await committeeProxy.candidates(i);
      if (address === candidate) {
        foundCandidate = true;
        break;
      }
    }
    foundCandidate.should.be.equal(true);
  }

  async function addOperator(operator) {
    const etherToken = await EtherToken.new(true, ton.address, true, {from: operator});

    const epochHandler = await EpochHandler.new({from: operator});
    const submitHandler = await SubmitHandler.new(epochHandler.address, {from: operator});

    const dummyStatesRoot = '0xdb431b544b2f5468e3f771d7843d9c5df3b4edcf8bc1c599f18f0b4ea8709bc3';
    const dummyTransactionsRoot = '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';
    const dummyReceiptsRoot = '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';

    const layer2 = await Layer2.new(
      epochHandler.address,
      submitHandler.address,
      etherToken.address,
      true,
      1,
      dummyStatesRoot,
      dummyTransactionsRoot,
      dummyReceiptsRoot,
      {from: operator}
    );

    await layer2.setSeigManager(seigManager.address, {from: operator});
    await registry.registerAndDeployCoinage(layer2.address, seigManager.address, {from: operator});
    return layer2;
  }

  async function isVoter(_agendaID, voter) {
    const agenda = await agendaManager.agendas(_agendaID);

    if (agenda[AGENDA_INDEX_STATUS] == AGENDA_STATUS_NOTICE)
      return (await committeeProxy.isMember(voter));
    else
      return (await agendaManager.isVoter(_agendaID, voter));
  }

  async function castVote(_agendaID, voter, vote) {
    const agenda1 = await agendaManager.agendas(_agendaID);
    const beforeCountingYes = agenda1[AGENDA_INDEX_COUNTING_YES];
    const beforeCountingNo = agenda1[AGENDA_INDEX_COUNTING_NO];
    const beforeCountingAbstain = agenda1[AGENDA_INDEX_COUNTING_ABSTAIN];

    (await isVoter(_agendaID, voter)).should.be.equal(true);

    const candidateContract = await getCandidateContract(voter);
    await candidateContract.castVote(_agendaID, vote, "test comment", {from: voter});

    const voterInfo2 = await agendaManager.voterInfos(_agendaID, voter);
    voterInfo2[VOTER_INFO_ISVOTER].should.be.equal(true);
    voterInfo2[VOTER_INFO_HAS_VOTED].should.be.equal(true);
    voterInfo2[VOTER_INFO_VOTE].should.be.bignumber.equal(toBN(vote));

    const agenda2 = await agendaManager.agendas(_agendaID);
    agenda2[AGENDA_INDEX_COUNTING_YES].should.be.bignumber.equal(toBN(beforeCountingYes).add(vote === VOTE_YES ? toBN(1) : toBN(0)));
    agenda2[AGENDA_INDEX_COUNTING_NO].should.be.bignumber.equal(toBN(beforeCountingNo).add(vote === VOTE_NO ? toBN(1) : toBN(0)));
    agenda2[AGENDA_INDEX_COUNTING_ABSTAIN].should.be.bignumber.equal(toBN(beforeCountingAbstain).add(vote === VOTE_ABSTAIN ? toBN(1) : toBN(0)));
  }

  async function getCandidateContract(candidate) {
    const contractAddress = await committeeProxy.candidateContract(candidate);
    return await Candidate.at(contractAddress);
  }

  describe('Execute', function () {
    beforeEach(async function () { 
      this.timeout(1000000);

      for (let i = 0; i < 3; i++) {
        const candidate = candidates[i];
        await addCandidate(candidate);
        const candidateContract = await getCandidateContract(candidate);
        await candidateContract.changeMember(i, {from: candidate});
      }
    });

    describe(`Agendas`, async function () {
      let testCases;
      const testContracts = ["TON", "WTON", "DepositManager", "SeigManager", "DAOCommitteeProxy", "DAOCommittee", "DAOVault"];
      testCases = [{
        name: "TON",
        functions: [{
            sig: "mint(address,uint256)",
            paramTypes: ["address", "uint256"],
            params: [user1, "12345"]
          }, {
            sig: "addMinter(address)",
            paramTypes: ["address"],
            params: [user1]
          }, {
            sig: "renounceMinter()",
            paramTypes: [],
            params: []
          }, {
            sig: "renounceOwnership()",
            paramTypes: [],
            params: []
          }
        ]
      }, {
        name: "WTON",
        functions: [{
          sig: "mint(address,uint256)",
          paramTypes: ["address", "uint256"],
          params: [user1, "12345"]
        }, {
          sig: "transferFrom(address,address,uint256)",
          paramTypes: ["address", "address", "uint256"],
          params: ["$DAOVault", user1, "12345"]
        }, {
          sig: "burnFrom(address,uint256)",
          paramTypes: ["address", "uint256"],
          params: ["$DAOVault", "12345"]
        }, {
          sig: "addMinter(address)",
          paramTypes: ["address"],
          params: [user1]
        }, {
          sig: "renounceMinter(address)",
          paramTypes: ["address"],
          params: ["$TON"]
        }, {
          sig: "renounceMinter()",
          paramTypes: [],
          params: []
        }, {
          sig: "renounceOwnership()",
          paramTypes: [],
          params: []
        }, {
          sig: "transferOwnership(address)",
          paramTypes: ["address"],
          params: [user1]
        }, {
          sig: "renounceTonMinter()",
          paramTypes: [],
          params: []
        }]
      }, {
        name: "DepositManager",
        functions: [{
          sig: "setGlobalWithdrawalDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "renounceOwnership()",
          paramTypes: [],
          params: []
        }, {
          sig: "transferOwnership(address)",
          paramTypes: ["address"],
          params: [user1]
        }]
      }, {
        name: "SeigManager",
        functions: [{
          sig: "pause()",
          paramTypes: [],
          params: []
        }, /*{
          sig: "unpause()",
          paramTypes: [],
          params: []
        }, */{
          sig: "setPowerTONSeigRate(uint256)",
          paramTypes: ["uint256"],
          params: ["110000000000000000000000000"]
        }, {
          sig: "setDaoSeigRate(uint256)",
          paramTypes: ["uint256"],
          params: ["110000000000000000000000000"]
        }, {
          sig: "setPseigRate(uint256)",
          paramTypes: ["uint256"],
          params: ["110000000000000000000000000"]
        }, {
          sig: "setAdjustDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "setMinimumAmount(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "addPauser(address)",
          paramTypes: ["address"],
          params: [user1]
        }, {
          sig: "renounceOwnership()",
          paramTypes: [],
          params: []
        }, {
          sig: "renouncePauser()",
          paramTypes: [],
          params: []
        }, {
          sig: "transferOwnership(address)",
          paramTypes: ["address"],
          params: [user1]
        }, {
          sig: "setDao(address)",
          paramTypes: ["address"],
          params: ["$DAOVault"]
        }, {
          sig: "setDaoSeigRate(uint256)",
          paramTypes: ["uint256"],
          params: ["1"]
        }, {
          sig: "renounceWTONMinter()",
          paramTypes: [],
          params: []
        }]
      }, {
        name: "Layer2Registry",
        //contract: registry,
        functions: [{
          sig: "transferOwnership(address)",
          paramTypes: ["address"],
          params: [user1]
        }]
      }, {
        name: "DAOCommitteeProxy",
        functions: [{
          sig: "setProxyPause(bool)",
          paramTypes: ["bool"],
          params: [true]
        }]
      }, {
        name: "DAOCommittee",
        functions: [{
          sig: "setActivityRewardPerSecond(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "increaseMaxMember(uint256,uint256)",
          paramTypes: ["uint256", "uint256"],
          params: ["12", "8"]
        }, {
          sig: "decreaseMaxMember(uint256,uint256)",
          paramTypes: ["uint256", "uint256"],
          params: ["0", "1"]
        }, {
          sig: "setQuorum(uint256)",
          paramTypes: ["uint256"],
          params: ["3"]
        }, {
          sig: "setCreateAgendaFees(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "setMinimumNoticePeriodSeconds(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "setMinimumVotingPeriodSeconds(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }]
      }, {
        name: "DAOVault",
        functions: [{
          sig: "approveTON(address,uint256)",
          paramTypes: ["address", "uint256"],
          params: [user1, "12345"]
        }, {
          sig: "approveWTON(address,uint256)",
          paramTypes: ["address", "uint256"],
          params: [user1, "12345"]
        }, {
          sig: "approveERC20(address,address,uint256)",
          paramTypes: ["address", "address", "uint256"],
          params: ["$TON", user1, "12345"]
        }, {
          sig: "claimTON(address,uint256)",
          paramTypes: ["address", "uint256"],
          params: [user1, "12345"]
        }, {
          sig: "claimWTON(address,uint256)",
          paramTypes: ["address", "uint256"],
          params: [user1, "12345"]
        }, {
          sig: "claimERC20(address,address,uint256)",
          paramTypes: ["address", "address", "uint256"],
          params: ["$TON", user1, "12345"]
        }]
      }]

      const testCasesMultiExecution = [
        [{
          name: "DepositManager",
          sig: "setGlobalWithdrawalDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }], [{
          name: "DepositManager",
          sig: "setGlobalWithdrawalDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          name: "SeigManager",
          sig: "setAdjustDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }], [{
          name: "DepositManager",
          sig: "setGlobalWithdrawalDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          name: "SeigManager",
          sig: "setAdjustDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }], [{
          name: "DAOCommittee",
          sig: "setMinimumNoticePeriodSeconds(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          name: "SeigManager",
          sig: "setAdjustDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }], [{
          name: "SeigManager",
          sig: "setPowerTONSeigRate(uint256)",
          paramTypes: ["uint256"],
          params: ["110000000000000000000000000"]
        }, {
          name: "SeigManager",
          sig: "setDaoSeigRate(uint256)",
          paramTypes: ["uint256"],
          params: ["110000000000000000000000000"]
        }, {
          name: "SeigManager",
          sig: "setPseigRate(uint256)",
          paramTypes: ["uint256"],
          params: ["110000000000000000000000000"]
        }], [{
          name: "DepositManager",
          sig: "setGlobalWithdrawalDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          name: "SeigManager",
          sig: "renounceWTONMinter()",
          paramTypes: [],
          params: []
        }, {
          name: "SeigManager",
          sig: "setAdjustDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }]
      ]

      let instances;
      beforeEach(async function () {
        instances = {
          TON: ton,
          WTON: wton,
          DepositManager: depositManager,
          SeigManager: seigManager,
          Layer2Registry: registry,
          DAOCommitteeProxy: daoCommitteeProxy,
          DAOCommittee: committeeProxy,
          DAOVault: daoVault
        }
      });

      for (let i = 0; i < testContracts.length; i++) {
        describe(`Contract: ${testContracts[i]}`, async function () {
          this.timeout(1000000);

          const testCase = testCases[i];

          for (let j = 0; j < testCase.functions.length; j++) {
            it(`agenda executing ${testCase.functions[j].sig}`, async function () {
              const testContract = instances[testCases[i].name];

              const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
              const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();

              const selector = web3.eth.abi.encodeFunctionSignature(testCase.functions[j].sig);

              function getParam(param) {
                if (typeof param === "string" && param[0] === "$") {
                    return instances[param.substring(1)].address
                } else {
                  return param;
                }
              }

              const params = testCase.functions[j].params.map(param => getParam(param));

              const functionBytecode = selector.concat(unmarshalString(
                web3.eth.abi.encodeParameters(
                  testCase.functions[j].paramTypes,
                  params
                ))
              );

              const param = web3.eth.abi.encodeParameters(
                ["address[]", "uint128", "uint128", "bool", "bytes[]"],
                [[testContract.address], noticePeriod.toString(), votingPeriod.toString(), true, [functionBytecode]]
              );

              const agendaFee = await agendaManager.createAgendaFees();
              await ton.approveAndCall(
                committeeProxy.address,
                agendaFee,
                param,
                {from: user1}
              );

              agendaID = (await agendaManager.numAgendas()).sub(toBN("1"));
              const agenda = await agendaManager.agendas(agendaID);  
              const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP];
              await time.increaseTo(noticeEndTimestamp);

              // cast vote
              for (let k = 0; k < 2; k++) {
                await castVote(agendaID, candidates[k], VOTE_YES);
              }

              const agenda2 = await agendaManager.agendas(agendaID);  
              const votingEndTimestamp = agenda2[AGENDA_INDEX_VOTING_END_TIMESTAMP];
              const currentTime = await time.latest();
              if (currentTime < votingEndTimestamp) {
                await time.increaseTo(votingEndTimestamp);
              }
              (await agendaManager.canExecuteAgenda(agendaID)).should.be.equal(true);

              // check status
              const agendaAfter = await agendaManager.agendas(agendaID);
              agendaAfter[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_WAITING_EXEC));

              await committeeProxy.executeAgenda(agendaID);
            });
          }
        });
      }

      for (let i = 0; i < testCasesMultiExecution.length; i++) {
        describe(`multi execution`, async function () {
          const testCase = testCasesMultiExecution[i];

          it(`agenda executing #${i}`, async function () {
            this.timeout(1000000);
            const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
            const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();

            function getParam(param) {
              if (typeof param === "string" && param[0] === "$") {
                  return instances[param.substring(1)].address
              } else {
                return param;
              }
            }

            let targets = [];
            let functionBytecode = [];
            for (let j = 0; j < testCase.length; j++) {
              targets.push(instances[testCase[j].name].address)
              const selector = web3.eth.abi.encodeFunctionSignature(testCase[j].sig);

              const params = testCase[j].params.map(param => getParam(param));

              functionBytecode.push(selector.concat(unmarshalString(
                web3.eth.abi.encodeParameters(
                  testCase[j].paramTypes,
                  params
                )))
              );
            }

            const param = web3.eth.abi.encodeParameters(
              ["address[]", "uint128", "uint128", "bool", "bytes[]"],
              [targets, noticePeriod.toString(), votingPeriod.toString(), true, functionBytecode]
            );

            const agendaFee = await agendaManager.createAgendaFees();
            await ton.approveAndCall(
              committeeProxy.address,
              agendaFee,
              param,
              {from: user1}
            );

            agendaID = (await agendaManager.numAgendas()).sub(toBN("1"));
            const agenda = await agendaManager.agendas(agendaID);  
            const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP];
            await time.increaseTo(noticeEndTimestamp);

            // cast vote
            for (let k = 0; k < 2; k++) {
              await castVote(agendaID, candidates[k], VOTE_YES);
            }

            const agenda2 = await agendaManager.agendas(agendaID);  
            const votingEndTimestamp = agenda2[AGENDA_INDEX_VOTING_END_TIMESTAMP];
            const currentTime = await time.latest();
            if (currentTime < votingEndTimestamp) {
              await time.increaseTo(votingEndTimestamp);
            }
            (await agendaManager.canExecuteAgenda(agendaID)).should.be.equal(true);

            // check status
            const agendaAfter = await agendaManager.agendas(agendaID);
            agendaAfter[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_WAITING_EXEC));

            await committeeProxy.executeAgenda(agendaID);
          });
        });
      }
    });
  });
});
