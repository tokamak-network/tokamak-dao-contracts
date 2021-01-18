const {
  defaultSender, accounts, contract, web3,
} = require('@openzeppelin/test-environment');
const {
  BN, constants, expectEvent, expectRevert, time, ether,
} = require('@openzeppelin/test-helpers');

const { padLeft, toBN } = require('web3-utils');
const { marshalString, unmarshalString } = require('./helpers/marshal');

const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');

const web3Helper = require('web3-abi-helper').Web3Helper;

const chai = require('chai');
const { expect } = chai;
chai.use(require('chai-bn')(BN)).should();

<<<<<<< Updated upstream:test/execute.test.js
=======
var DaoContracts = require('../utils/plasma_test_deploy.js');

var DAOCommitteeJson = require('../build/contracts/DAOCommittee.json');

>>>>>>> Stashed changes:test/agenda.committee.test.js
// dao-contracts
const DAOVault2 = contract.fromArtifact('DAOVault2');
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
const DAOVault = contract.fromArtifact('DAOVault');

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

const CANDIDATE_INFO_INDEX_CANDIDATE_CONTRACT = 0;
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
const AGENDA_INDEX_REWARD = 9;
const AGENDA_INDEX_STATUS = 10;
const AGENDA_INDEX_RESULT = 11;
//const AGENDA_INDEX_VOTERS = 12;
const AGENDA_INDEX_EXECUTED = 12;

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
const VOTER_INFO_VOTE = 2;

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
let daoVault2, committeeProxy, committee, activityRewardManager , agendaManager, candidateFactory;
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
let daoVault;
let seigManager;
let powerton;

<<<<<<< Updated upstream:test/execute.test.js
=======
//
let noticePeriod, votingPeriod , agendaFee; 
let layer2s=[];

let DaoDeployed = new DaoContracts(); 
let objectAbiMapping = null ;

>>>>>>> Stashed changes:test/agenda.committee.test.js
describe('Test 1', function () {
  beforeEach(async function () {
    this.timeout(1000000);
    console.log('owner:',owner );
    objectAbiMapping = await DaoDeployed.objectMapping( DAOCommitteeJson.abi ) ;
 
    let  initializePlasma = await DaoDeployed.initializePlasmaEvmContracts(owner);
 
    ton = initializePlasma.ton;
    wton = initializePlasma.wton;
    registry = initializePlasma.registry;
    depositManager = initializePlasma.depositManager;
    factory = initializePlasma.coinageFactory;
    daoVault = initializePlasma.daoVault;
    seigManager = initializePlasma.seigManager;
    powerton = initializePlasma.powerton;
     

    let  initializeDao = await DaoDeployed.initializeDaoContracts(owner);
 
    daoVault2 = initializeDao.daoVault2;
    agendaManager = initializeDao.agendaManager;
    candidateFactory = initializeDao.candidateFactory;
    committee = initializeDao.committee;
    committeeProxy = initializeDao.committeeProxy; 
    
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
<<<<<<< Updated upstream:test/execute.test.js


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
    daoVault = await DAOVault.new(wton.address, currentTime);
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
    await seigManager.setDao(daoVault.address);
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
    await wton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));

    await seigManager.setMinimumAmount(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT))


  }

  async function initializeDaoContracts() {
    debugLog =false;
    if(debugLog) console.log('ton :', ton.address) ;

    //===================================================
    daoVault2 = await DAOVault2.new(ton.address, wton.address);
    if(debugLog)  console.log('daoVault2 :', daoVault2.address) ;
    //===================================================
    agendaManager = await DAOAgendaManager.new(ton.address);
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
      daoVault2.address
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
    await committeeProxy.setMaxMember(3);

    ////////////////////////////////////////////////////////////////////////
    // test setting
    await committeeProxy.setActivityRewardPerSecond(toBN("1"));
    await agendaManager.setMinimunNoticePeriodSeconds(toBN("10000"));
    await agendaManager.setMinimunVotingPeriodSeconds(toBN("10000"));
    await ton.mint(daoVault2.address, toBN("99999999999999999999999999999999999"));
    await wton.mint(daoVault2.address, toBN("99999999999999999999999999999999999"));

    ////////////////////////////////////////////////////////////////////////
    // permissions
    await daoVault2.approveTON(committeeProxy.address, toBN("9999999999999999999999999999"));
    await daoVault2.approveWTON(committeeProxy.address, toBN("9999999999999999999999999999999999999"));

    await ton.addMinter(committeeProxy.address);
    await ton.transferOwnership(committeeProxy.address);

    await wton.addMinter(committeeProxy.address);
    await wton.transferOwnership(committeeProxy.address);

    await seigManager.addPauser(committeeProxy.address);

    await registry.transferOwnership(committeeProxy.address);
    await seigManager.transferOwnership(committeeProxy.address);
    await depositManager.transferOwnership(committeeProxy.address);

    await daoVault2.transferOwnership(committeeProxy.address);
    await agendaManager.setCommittee(committeeProxy.address);
    await agendaManager.transferOwnership(committeeProxy.address);
    //await committee.transferOwnership(committeeProxy.address);

  } 

=======
 /* 
>>>>>>> Stashed changes:test/agenda.committee.test.js
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
  */

  async function totalBalanceOfCandidate(candidate) {
    const candidateContractAddress = await committeeProxy.candidateContract(candidate);
    const coinageAddress = await seigManager.coinages(candidateContractAddress);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    return await coinage.totalSupply();
  }

  /* 

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
  */

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
/* 
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
  */

  async function isVoter(_agendaID, voter) {
    const agenda = await agendaManager.agendas(_agendaID);

<<<<<<< Updated upstream:test/execute.test.js
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
=======
    await newSeigManager.setPowerTON(powerton.address); 
    await newSeigManager.setDao(daoVault2.address);
    await wton.addMinter(newSeigManager.address);
    //await ton.addMinter(wton.address);
    
    /* 
    await Promise.all([
      depositManager,
      wton,
    ].map(contract => contract.setSeigManager(newSeigManager.address)));
    */ 

    newSeigManager.setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT));
    newSeigManager.setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT));
    newSeigManager.setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT));
    await newSeigManager.setMinimumAmount(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT))
    
    /* 
   console.log('layer2s[0].address', layer2s[0].address);
   console.log('seigManager', seigManager.address);
   console.log('registry.owner', await registry.owner());
   console.log('committeeProxy.address',committeeProxy.address);
    */
   
   //onlyOperatorOrSeigManager
   const _layer0 = await Layer2.at(layer2s[0].address);
   await _layer0.setSeigManager(newSeigManager.address,{from: operator1});
   const _layer1 = await Layer2.at(layer2s[1].address);
   await _layer1.setSeigManager(newSeigManager.address,{from: operator2});

   //onlyOwnerOrOperator : committeeProxy 에서 실행하거나, 
   await registry.deployCoinage(layer2s[0].address, newSeigManager.address, {from: operator1});
   await registry.deployCoinage(layer2s[1].address, newSeigManager.address, {from: operator2});

   await wton.setSeigManager(newSeigManager.address);
   await powerton.setSeigManager(newSeigManager.address);
 
   const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
   const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);

   const coinageAddress = await newSeigManager.coinages(_layer1.address); 
   const coinage = await AutoRefactorCoinage.at(coinageAddress);
    // const stakedAmount = await coinage.balanceOf(operator2);
    // stakedAmount.should.be.bignumber.equal(stakeAmountWTON);
  
    expect(coinageAddress).to.not.equal(ZERO_ADDRESS);
    return newSeigManager;
  }
  
  async function addlayer2s(operator){
    let _layer2 = await DaoDeployed.addOperator(operator);
    layer2s.push(_layer2); 
  } 

  function setDaoContract(dao){ 
    if(dao!=null){
      if(dao.ton!=null) ton = dao.ton;
      if(dao.seigManager!=null) seigManager = dao.seigManager;
      if(dao.registry!=null) registry = dao.registry;
     // if(dao.ton!=null) ton = dao.ton;
     // if(dao.ton!=null) ton = dao.ton; 
    }   
  }  
   
  async function agendaVoteYesAll(agendaid, candidates){
    const agenda = await agendaManager.agendas(agendaid);  
    const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP]; 
    time.increaseTo(noticeEndTimestamp); 
    await committeeProxy.castVote(agendaid,1,' candidate1 yes ', {from: candidate1});  
    const agendaAfterStartVoting = await agendaManager.agendas(agendaid);   
    const votingEndTimestamp = agendaAfterStartVoting.votingEndTimestamp; 
    await committeeProxy.castVote(agendaid,1,' candidate2 yes ',{from:candidate2}); 
    time.increaseTo(votingEndTimestamp);
   
  }  

  async function balanceOfAccountByLayer2(_layer2, _account){
    const coinageAddress = await seigManager.coinages(_layer2);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmountWTON = await coinage.balanceOf(_account);

    return stakedAmountWTON; 
  }
  
  async function createAgenda(_target, _functionBytecode){ 
      const param = web3.eth.abi.encodeParameters(
        ["address", "uint256", "uint256", "bytes"],
        [_target, noticePeriod.toString(), votingPeriod.toString(), _functionBytecode]
      );
      // create agenda
      await ton.approveAndCall(
        committeeProxy.address,
        agendaFee,
        param,
        {from: user1}
      );
      agendaID = (await agendaManager.numAgendas()).sub(toBN("1")); 
      return agendaID;
  }
>>>>>>> Stashed changes:test/agenda.committee.test.js

    (await isVoter(_agendaID, voter)).should.be.equal(true);

    await committeeProxy.castVote(_agendaID, vote, "test comment", {from: voter});

<<<<<<< Updated upstream:test/execute.test.js
    const voterInfo2 = await agendaManager.voterInfos(_agendaID, voter);
    voterInfo2[VOTER_INFO_ISVOTER].should.be.equal(true);
    voterInfo2[VOTER_INFO_HAS_VOTED].should.be.equal(true);
    voterInfo2[VOTER_INFO_VOTE].should.be.bignumber.equal(toBN(vote));
=======
    await DaoDeployed.addCandidate(candidate1);
    await DaoDeployed.addCandidate(candidate2);
    await DaoDeployed.addCandidate(candidate3); 
>>>>>>> Stashed changes:test/agenda.committee.test.js

    const agenda2 = await agendaManager.agendas(_agendaID);
    agenda2[AGENDA_INDEX_COUNTING_YES].should.be.bignumber.equal(beforeCountingYes.add(vote === VOTE_YES ? toBN(1) : toBN(0)));
    agenda2[AGENDA_INDEX_COUNTING_NO].should.be.bignumber.equal(beforeCountingNo.add(vote === VOTE_NO ? toBN(1) : toBN(0)));
    agenda2[AGENDA_INDEX_COUNTING_ABSTAIN].should.be.bignumber.equal(beforeCountingAbstain.add(vote === VOTE_ABSTAIN ? toBN(1) : toBN(0)));
  }

<<<<<<< Updated upstream:test/execute.test.js
  describe('Execute', function () {
    beforeEach(async function () { 
      this.timeout(1000000);

      for (let i = 0; i < 3; i++) {
        await addCandidate(candidates[i]);
        await committeeProxy.changeMember(i, {from: candidates[i]});
      }
    });

    describe(`Agendas`, async function () {
      let testCases;
      const testContracts = ["TON", "WTON", "DepositManager", "SeigManager", "DAOCommitteeProxy", "DAOCommittee", "DAOVault2"];
      testCases = [{
        name: "TON",
        functions: [{
            sig: "mint(address,uint256)",
            paramTypes: ["address", "uint256"],
            params: [user1, "12345"]
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
          params: ["$DAOVault2", user1, "12345"]
        }, {
          sig: "burnFrom(address,uint256)",
          paramTypes: ["address", "uint256"],
          params: ["$DAOVault2", "12345"]
        }]
      }, {
        name: "DepositManager",
        functions: [{
          sig: "setGlobalWithdrawalDelay(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
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
        }]
      }, /*{
        name: "Layer2Registry",
        //contract: registry,
        functions: [{
          sig: "unregister(address)",
          paramTypes: ["address"],
          params: []
        }]
      }, */{
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
          sig: "setMaxMember(uint256)",
          paramTypes: ["uint256"],
          params: ["12"]
        }, {
          sig: "reduceMemberSlot(uint256)",
          paramTypes: ["uint256"],
          params: ["0"]
        }, {
          sig: "setQuorum(uint256,uint256)",
          paramTypes: ["uint256", "uint256"],
          params: ["3", "5"]
        }, {
          sig: "setCreateAgendaFees(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "setMinimunNoticePeriodSeconds(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }, {
          sig: "setMinimunVotingPeriodSeconds(uint256)",
          paramTypes: ["uint256"],
          params: ["12345"]
        }]
      }, {
        name: "DAOVault2",
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
          DAOVault2: daoVault2
        }
      });

      for (let i = 0; i < testContracts.length; i++) {
        describe(`Contract: ${testContracts[i]}`, async function () {
          this.timeout(1000000);

          const testCase = testCases[i];

          for (let j = 0; j < testCase.functions.length; j++) {
            it(`agenda executing ${testCase.functions[j].sig}`, async function () {
              const testContract = instances[testCases[i].name];

              const noticePeriod = await agendaManager.minimunNoticePeriodSeconds();
              const votingPeriod = await agendaManager.minimunVotingPeriodSeconds();

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
                ["address", "uint256", "uint256", "bytes"],
                [testContract.address, noticePeriod.toString(), votingPeriod.toString(), functionBytecode]
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

              // check status
              const agendaAfter = await agendaManager.agendas(agendaID);
              agendaAfter[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_WAITING_EXEC));

              await committeeProxy.executeAgenda(agendaID);
            });
          }
        });
      }
=======
    it('committeeProxy.transferOwnership to committeeProxy self ', async function () {  
      await committeeProxy.transferOwnership(committeeProxy.address);
      expect(await committeeProxy.owner()).to.equal(committeeProxy.address);
    });
    it('committeeProxy.setDaoVault', async function () {   
      let _daoVault2 = await DAOVault2.new(ton.address, wton.address);

      const selector = web3.eth.abi.encodeFunctionSignature("setDaoVault(address)");   
      const data = padLeft(_daoVault2.address, 64); 
      const functionBytecode = selector.concat(data.substring(2));   
      let agendaID = await createAgenda(committeeProxy.address,functionBytecode);
      await agendaVoteYesAll(agendaID, candidates); 
      await committeeProxy.executeAgenda(agendaID);   
      expect(await committeeProxy.daoVault()).to.equal(_daoVault2.address); 
    });
    it('committeeProxy.setLayer2Registry', async function () {  
      let _registry = await Layer2Registry.new({from:owner}); 
      const selector = web3.eth.abi.encodeFunctionSignature("setLayer2Registry(address)");   
      const data = padLeft(_registry.address, 64); 
      const functionBytecode = selector.concat(data.substring(2));   
      let agendaID = await createAgenda(committeeProxy.address,functionBytecode);
      await agendaVoteYesAll(agendaID, candidates); 
      await committeeProxy.executeAgenda(agendaID);   
      expect(await committeeProxy.layer2Registry()).to.equal(_registry.address); 
    });
    /* 
    it('committeeProxy.setAgendaManager', async function () {  
      this.agendaManager = await DAOAgendaManager.new(this.ton.address,{from:owner}); 
      const selector = web3.eth.abi.encodeFunctionSignature("setAgendaManager(address)");   
      const data = padLeft(_agendaManager.address, 64); 
      const functionBytecode = selector.concat(data.substring(2));   
      let agendaID = await createAgenda(committeeProxy.address,functionBytecode);
      await agendaVoteYesAll(agendaID, candidates); 
      await committeeProxy.executeAgenda(agendaID);   
      expect(await committeeProxy.agendaManager()).to.equal(_agendaManager.address);  
    });
    */
    it('committeeProxy.setSeigManager', async function () {  
      let _newSeigManager = await newSeigManager();
      const selector = web3.eth.abi.encodeFunctionSignature("setSeigManager(address)");   
      const data = padLeft(_newSeigManager.address, 64); 
      const functionBytecode = selector.concat(data.substring(2));   
      let agendaID = await createAgenda(committeeProxy.address,functionBytecode);
      await agendaVoteYesAll(agendaID, candidates); 
      await committeeProxy.executeAgenda(agendaID);   
      expect(await committeeProxy.seigManager()).to.equal(_newSeigManager.address); 
 
    });
    it('committeeProxy.setCandidateFactory', async function () { 
      let _candidateFactory = await CandidateFactory.new({from:owner});
      const selector = web3.eth.abi.encodeFunctionSignature("setCandidateFactory(address)");   
      const data = padLeft(_candidateFactory.address, 64); 
      const functionBytecode = selector.concat(data.substring(2));   
      let agendaID = await createAgenda(committeeProxy.address,functionBytecode);
      await agendaVoteYesAll(agendaID, candidates); 
      await committeeProxy.executeAgenda(agendaID);   
      expect(await committeeProxy.candidateFactory()).to.equal(_candidateFactory.address); 
 
    });

    it('committeeProxy.registerOperatorByOwner', async function () {  
      //let objectMapping = await DaoDeployed.objectMapping( DAOCommitteeJson.abi ) 
      console.log(objectAbiMapping.registerOperatorByOwner) ;

      //const selector = web3.eth.abi.encodeFunctionSignature("registerOperatorByOwner(address,address,string)");   
      
      let params = [operator1, layer2s[0],'operator1 ']; 
       
      //let functionBytecode = web3Helper.encodeMethod(objectAbiMapping.registerOperatorByOwner, params);
      //let functionBytecode =  web3.eth.abi.encodeFunctionCall(method, params);
      //console.log('registerOperatorByOwner ', functionBytecode) ;
      //const data = padLeft(_candidateFactory.address, 64); 
      //const functionBytecode = selector.concat(data.substring(2));   
    //  let agendaID = await createAgenda(committeeProxy.address,functionBytecode);
    //  await agendaVoteYesAll(agendaID, candidates); 
    //  await committeeProxy.executeAgenda(agendaID);   
     // expect(await committeeProxy.candidateFactory()).to.equal(_candidateFactory.address); 
 
    });  

    /* 
    it('committeeProxy.setTon', async function () {  
       
    });
    */
    //--
    it('committeeProxy.renounceOwnership', async function () {  
      const selector = web3.eth.abi.encodeFunctionSignature("renounceOwnership()");  
      const functionBytecode = selector ;   
      let agendaID = await createAgenda(committeeProxy.address,functionBytecode);
      await agendaVoteYesAll(agendaID, candidates); 
      await committeeProxy.executeAgenda(agendaID);   
      expect(await committeeProxy.owner()).to.equal(ZERO_ADDRESS); 
    });

    /* 
   
    //-- 
    it('committeeProxy.setActivityRewardPerSecond', async function () {  
       
    }); 
    it('committeeProxy.setMaxMember', async function () {  
       
    }); 
    it('committeeProxy.reduceMemberSlot', async function () {  
       
    }); 
    it('committeeProxy.setAgendaStatus', async function () {  
       
    });
    it('committeeProxy.setQuorum', async function () {  
       
    });
    it('committeeProxy.setCreateAgendaFees', async function () {  
       
    });
    it('committeeProxy.setMinimunNoticePeriodSeconds', async function () {  
       
>>>>>>> Stashed changes:test/agenda.committee.test.js
    });
  });
});
