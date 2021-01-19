const {
  defaultSender, accounts, contract, web3,
} = require('@openzeppelin/test-environment');
const {
  BN, constants, expectEvent, expectRevert, time, ether,
} = require('@openzeppelin/test-helpers');

const { padLeft, toBN } = require('web3-utils');
const { marshalString, unmarshalString } = require('../test/helpers/marshal');

const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');

const chai = require('chai');
const { expect } = chai;
chai.use(require('chai-bn')(BN)).should();

//const { deployPlasmaEvmContracts, deployDaoContracts } = require('./utils/deploy');
//const deployPlasmaEvmContracts = require('./utils/deploy.js');

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

const [ candidate1, candidate2, candidate3, user1, user2, user3, user4,user5,operator1,operator2] = accounts;
const candidates = [candidate1, candidate2, candidate3];
const users = [user1, user2, user3, user4, user5];
const operators = [operator1,operator2];

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
const TON_USER_STAKE_AMOUNT = _TON('10');
////////////////////////////////////////////////////////////////////////////////

const owner= defaultSender;
let daoVault2, committeeProxy, committee, activityRewardManager , agendaManager, candidateFactory;
let gasUsedRecords = [];
let gasUsedTotal = 0; 
let debugLog=true;
let tx  ; 
//------------------

class DaoContracts {

  constructor() {
    this.ton = null;
    this.wton = null; 
    this.registry = null; 
    this.depositManager = null; 
    this.factory = null; 
    this.daoVault = null; 
    this.seigManager = null; 
    this.powerton = null;
  
    this.daoVault2 = null;
    this.agendaManager = null;
    this.candidateFactory = null;
    this.committee = null;
    this.committeeProxy = null; 
  }

  initializePlasmaEvmContracts= async function (owner) {
    //this = self;
    //console.log(' initializePlasmaEvmContracts owner:',owner );

    this.ton = await TON.new({from:owner});  
    this.wton = await WTON.new(this.ton.address,{from:owner});
    this.registry = await Layer2Registry.new({from:owner});
    this.depositManager = await DepositManager.new(
      this.wton.address,
      this.registry.address,
        WITHDRAWAL_DELAY,
        {from:owner}
      );
      this.factory = await CoinageFactory.new({from:owner});
  
      let currentTime = await time.latest();
      console.log(`currentTime1: ${currentTime}`);
      this.daoVault = await DAOVault.new(this.wton.address, currentTime,{from:owner});
      this.seigManager = await SeigManager.new(
        this.ton.address,
        this.wton.address,
        this.registry.address,
        this.depositManager.address,
        SEIG_PER_BLOCK.toFixed(WTON_UNIT),
        this.factory.address
        ,{from:owner}
      );
      this.powerton = await PowerTON.new(
        this.seigManager.address,
        this.wton.address,
        ROUND_DURATION,
        {from:owner}
      );
      await this.powerton.init({from:owner});
  
      await this.seigManager.setPowerTON(this.powerton.address,{from:owner});
      await this.powerton.start({from:owner});
      await this.seigManager.setDao(this.daoVault.address,{from:owner});
      await this.wton.addMinter(this.seigManager.address,{from:owner});
      await this.ton.addMinter(this.wton.address,{from:owner});
      
      await Promise.all([
        this.depositManager,
        this.wton,
      ].map(contract => contract.setSeigManager(this.seigManager.address,{from:owner})));
        
      // ton setting
      await this.ton.mint(deployer, TON_INITIAL_SUPPLY.toFixed(TON_UNIT),{from:owner});
      await this.ton.approve(this.wton.address, TON_INITIAL_SUPPLY.toFixed(TON_UNIT),{from:owner});
       
      this.seigManager.setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT),{from:owner});
      this.seigManager.setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT),{from:owner});
      this.seigManager.setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT),{from:owner});
      await candidates.map(account => this.ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),{from:owner});
      await users.map(account => this.ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),{from:owner});  
      await operators.map(account => this.ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),{from:owner});  
  
      await this.wton.mint(this.daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT),{from:owner});
  
      await this.seigManager.setMinimumAmount(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT),{from:owner})
    
      let returnData ={
        ton: this.ton, 
        wton: this.wton, 
        registry: this.registry ,
        depositManager: this.depositManager, 
        coinageFactory: this.factory, 
        daoVault: this.daoVault, 
        seigManager : this.seigManager, 
        powerton: this.powerton
      }
      return  returnData;
      
    }

    initializeDaoContracts  = async function (owner ) {
      //this = self;
      this.daoVault2 = await DAOVault2.new(this.ton.address, this.wton.address,{from:owner});
      this.agendaManager = await DAOAgendaManager.new(this.ton.address,{from:owner});
      this.candidateFactory = await CandidateFactory.new({from:owner});
      this.committee = await DAOCommittee.new({from:owner});
      this.daoCommitteeProxy = await DAOCommitteeProxy.new(
        this.ton.address,
        this.committee.address,
        this.seigManager.address,
        this.registry.address,
        this.agendaManager.address,
        this.candidateFactory.address,
        this.daoVault2.address,
        {from:owner}
      );  
      let impl = await this.daoCommitteeProxy.implementation({from:owner}) ;
  
      this.committeeProxy = await DAOCommittee.at(this.daoCommitteeProxy.address,{from:owner}); 
        
      await this.committeeProxy.setMaxMember(3,{from:owner});
  
      ////////////////////////////////////////////////////////////////////////
      // test setting
      await this.committeeProxy.setActivityRewardPerSecond(toBN("1"),{from:owner});
      await this.agendaManager.setMinimunNoticePeriodSeconds(toBN("10000"),{from:owner});
      await this.agendaManager.setMinimunVotingPeriodSeconds(toBN("10000"),{from:owner});
  
      ////////////////////////////////////////////////////////////////////////
  
      await this.registry.transferOwnership(this.committeeProxy.address,{from:owner});
      await this.daoVault2.transferOwnership(this.committeeProxy.address,{from:owner});
      await this.agendaManager.setCommittee(this.committeeProxy.address,{from:owner});
      await this.agendaManager.transferOwnership(this.committeeProxy.address,{from:owner});
      await this.committee.transferOwnership(this.committeeProxy.address,{from:owner});
  
      console.log('\n\n');
    
      let returnData ={
        daoVault2: this.daoVault2, 
        agendaManager: this.agendaManager, 
        candidateFactory: this.candidateFactory ,
        committee: this.committee, 
        committeeProxy: this.committeeProxy 
      }
      return  returnData;
    } 

    getPlasamContracts  = function () {
      return { 
        ton: this.ton,
        wton: this.wton,
        registry: this.registry,
        depositManager: this.depositManager,
        coinageFactory: this.coinageFactory,
        daoVault: this.daoVault,
        seigManager: this.seigManager,
        powerton: this.powerton };
    } 
    getDaoContracts  = function () {
      return { 
        daoVault2 : this.daoVault2,
        agendaManager: this.agendaManager,
        candidateFactory: this.candidateFactory,
        committee: this.committee,
        committeeProxy: this.committeeProxy
      };
    }  


  addOperator = async function(operator) {
    const etherToken = await EtherToken.new(true, this.ton.address, true, {from: operator});

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

    await layer2.setSeigManager(this.seigManager.address, {from: operator});
    await this.registry.registerAndDeployCoinage(layer2.address, this.seigManager.address, {from: operator});
    
    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);

    const minimum = await this.seigManager.minimumAmount();
    const beforeTonBalance = await this.ton.balanceOf(operator); 
    await this.deposit(layer2.address, operator, stakeAmountTON);

    const afterTonBalance = await this.ton.balanceOf(operator);
    beforeTonBalance.sub(afterTonBalance).should.be.bignumber.equal(stakeAmountTON);

    const coinageAddress = await this.seigManager.coinages(layer2.address);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmount = await coinage.balanceOf(operator);
    stakedAmount.should.be.bignumber.equal(stakeAmountWTON);
    
    return layer2;
  }


  deposit = async function(candidateContractAddress, account, tonAmount) {
    const beforeBalance = await this.ton.balanceOf(account);
    beforeBalance.should.be.bignumber.gte(tonAmount);
    const data = marshalString(
      [this.depositManager.address, candidateContractAddress]
        .map(unmarshalString)
        .map(str => padLeft(str, 64))
        .join(''),
    );
    await this.ton.approveAndCall(
      this.wton.address,
      tonAmount,
      data,
      {from: account}
    );
    const afterBalance = await this.ton.balanceOf(account);
    beforeBalance.sub(afterBalance).should.be.bignumber.equal(tonAmount);
    return true;
  }

  addCandidate = async function (candidate) { 
    const minimum = await this.seigManager.minimumAmount();
    const beforeTonBalance = await this.ton.balanceOf(candidate);

    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    //await ton.approve(committeeProxy.address, stakeAmountTON, {from: candidate});
    //tmp = await ton.allowance(candidate, committeeProxy.address);
    //tmp.should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT));
    await this.committeeProxy.createCandidate(candidate, {from: candidate});

    const candidateContractAddress = await this.committeeProxy.candidateContract(candidate);

    //const testMemo = "candidate memo string";
    //const data = web3.eth.abi.encodeParameter("string", testMemo);

    (await this.registry.layer2s(candidateContractAddress)).should.be.equal(true);

    await this.deposit(candidateContractAddress, candidate, stakeAmountTON);
     
    const afterTonBalance = await this.ton.balanceOf(candidate);
    beforeTonBalance.sub(afterTonBalance).should.be.bignumber.equal(stakeAmountTON);

    const coinageAddress = await this.seigManager.coinages(candidateContractAddress);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmount = await coinage.balanceOf(candidate);
    stakedAmount.should.be.bignumber.equal(stakeAmountWTON);

    const candidatesLength = await this.committeeProxy.candidatesLength();
    let foundCandidate = false;
    for (let i = 0; i < candidatesLength; i++) {
      const address = await this.committeeProxy.candidates(i);
      if (address === candidate) {
        foundCandidate = true;
        break;
      }
    }
    foundCandidate.should.be.equal(true);

  }

  newSeigManager = async function (layer2s,operator1,operator2){
    var newSeigManager = await SeigManager.new(
      this.ton.address,
      this.wton.address,
      this.registry.address,
      this.depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      this.factory.address
    ); 

    await newSeigManager.setPowerTON(this.powerton.address); 
    await newSeigManager.setDao(this.daoVault2.address);
    await this.wton.addMinter(newSeigManager.address);
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
     
   //onlyOperatorOrSeigManager
   const _layer0 = await Layer2.at(layer2s[0].address);
   await _layer0.setSeigManager(newSeigManager.address,{from: operator1});
   const _layer1 = await Layer2.at(layer2s[1].address);
   await _layer1.setSeigManager(newSeigManager.address,{from: operator2});

   //onlyOwnerOrOperator : committeeProxy 에서 실행하거나, 
   await this.registry.deployCoinage(layer2s[0].address, newSeigManager.address, {from: operator1});
   await this.registry.deployCoinage(layer2s[1].address, newSeigManager.address, {from: operator2});

   await this.wton.setSeigManager(newSeigManager.address);
   await this.powerton.setSeigManager(newSeigManager.address);
 
   const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
   const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);

   const coinageAddress = await newSeigManager.coinages(_layer1.address); 
   const coinage = await AutoRefactorCoinage.at(coinageAddress);
    // const stakedAmount = await coinage.balanceOf(operator2);
    // stakedAmount.should.be.bignumber.equal(stakeAmountWTON);
  
    expect(coinageAddress).to.not.equal(ZERO_ADDRESS);
    return newSeigManager;
  } 
  
  setDaoContract = async (data) => {
    if(data!=null){
      if(data.seigManager!=null)  this.seigManager = data.seigManager ;
      if(data.ton!=null)  this.ton = data.ton ;
      if(data.wton!=null)  this.wton = data.wton ;
      if(data.powerton!=null)  this.powerton = data.powerton ;
      if(data.registry!=null)  this.registry = data.registry ;
      if(data.depositManager!=null)  this.depositManager = data.depositManager ;
      if(data.factory!=null)  this.factory = data.factory ; 
    } 
    
  }

  balanceOfAccountByLayer2 = async function(_layer2, _account){
    const coinageAddress = await this.seigManager.coinages(_layer2);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmountWTON = await coinage.balanceOf(_account);

    return stakedAmountWTON; 
  }
  
objectMapping = async ( abi ) => {  
  let objects = {} ;
  if(abi!=null && abi.length > 0 ){
    for(let i=0; i< abi.length ; i++ ){
      //let inputs = abi[i].inputs; 
       
      if(abi[i].type=="function"){
        objects[abi[i].name] =   abi[i] ; 
      } 
    }
  } 
  return objects;
}  

} 
 

let ton;
let wton;
let registry;
let depositManager;
let factory;
let daoVault;
let seigManager;
let powerton;
 
/* 
DaoContracts.prototype.initializePlasmaEvmContracts  = async function (owner) {
  //this = self;
  this.ton = await TON.new({from:owner});
  this.wton = await WTON.new(ton.address,{from:owner});
  this.registry = await Layer2Registry.new({from:owner});
  this.depositManager = await DepositManager.new(
    this.wton.address,
    this.registry.address,
      WITHDRAWAL_DELAY,
      {from:owner}
    );
    this.factory = await CoinageFactory.new({from:owner});

    let currentTime = await time.latest();
    console.log(`currentTime1: ${currentTime}`);
    this.daoVault = await DAOVault.new(this.wton.address, currentTime,{from:owner});
    this.seigManager = await SeigManager.new(
      this.ton.address,
      this.wton.address,
      this.registry.address,
      this.depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      this.factory.address
      ,{from:owner}
    );
    this.powerton = await PowerTON.new(
      this.seigManager.address,
      this.wton.address,
      ROUND_DURATION,
      {from:owner}
    );
    await this.powerton.init({from:owner});

    await this.seigManager.setPowerTON(this.powerton.address,{from:owner});
    await this.powerton.start({from:owner});
    await this.seigManager.setDao(this.daoVault.address,{from:owner});
    await this.wton.addMinter(this.seigManager.address,{from:owner});
    await this.ton.addMinter(this.wton.address,{from:owner});
    
    await Promise.all([
      this.depositManager,
      this.wton,
    ].map(contract => contract.setSeigManager(this.seigManager.address,{from:owner})));
      
    // ton setting
    await this.ton.mint(deployer, TON_INITIAL_SUPPLY.toFixed(TON_UNIT),{from:owner});
    await this.ton.approve(this.wton.address, TON_INITIAL_SUPPLY.toFixed(TON_UNIT),{from:owner});
     
    this.seigManager.setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT),{from:owner});
    this.seigManager.setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT),{from:owner});
    this.seigManager.setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT),{from:owner});
    await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),{from:owner});
    await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),{from:owner});  
    await operators.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),{from:owner});  

    await this.wton.mint(this.daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT),{from:owner});

    await this.seigManager.setMinimumAmount(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT),{from:owner})
  
    let returnData ={
      ton: ton, 
      wton: wton, 
      registry:registry ,
      depositManager: depositManager, 
      coinageFactory: factory, 
      daoVault: daoVault, 
      seigManager : seigManager, 
      powerton: powerton
    }
    return  returnData;
    
  }
*/
/* 
DaoContracts.prototype.initializeDaoContracts  = async function (owner ) {
    //this = self;
    this.daoVault2 = await DAOVault2.new(this.ton.address, this.wton.address,{from:owner});
    this.agendaManager = await DAOAgendaManager.new(this.ton.address,{from:owner});
    this.candidateFactory = await CandidateFactory.new({from:owner});
    this.committee = await DAOCommittee.new({from:owner});
    this.daoCommitteeProxy = await DAOCommitteeProxy.new(
      this.ton.address,
      this.committee.address,
      this.seigManager.address,
      this.registry.address,
      this.agendaManager.address,
      this.candidateFactory.address,
      this.daoVault2.address,
      {from:owner}
    );  
    let impl = await this.daoCommitteeProxy.implementation({from:owner}) ;

    this.committeeProxy = await DAOCommittee.at(this.daoCommitteeProxy.address,{from:owner}); 
      
    await this.committeeProxy.setMaxMember(3,{from:owner});

    ////////////////////////////////////////////////////////////////////////
    // test setting
    await this.committeeProxy.setActivityRewardPerSecond(toBN("1"),{from:owner});
    await this.agendaManager.setMinimunNoticePeriodSeconds(toBN("10000"),{from:owner});
    await this.agendaManager.setMinimunVotingPeriodSeconds(toBN("10000"),{from:owner});

    ////////////////////////////////////////////////////////////////////////

    await this.registry.transferOwnership(committeeProxy.address,{from:owner});
    await this.daoVault2.transferOwnership(committeeProxy.address,{from:owner});
    await this.agendaManager.setCommittee(committeeProxy.address,{from:owner});
    await this.agendaManager.transferOwnership(committeeProxy.address,{from:owner});
    await this.committee.transferOwnership(committeeProxy.address,{from:owner});

    console.log('\n\n');
  
    let returnData ={
      daoVault2: daoVault2, 
      agendaManager: agendaManager, 
      candidateFactory:candidateFactory ,
      committee: committee, 
      committeeProxy: committeeProxy 
    }
    return  returnData;
  } 
  */ 
  module.exports =  DaoContracts;