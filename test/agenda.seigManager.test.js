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

const DaoContracts = require('../utils/plasma_test_deploy.js');
const DAOCommitteeAbi = require('../build/contracts/DAOCommittee.json').abi;
const DepositManagerAbi = require('../build/contracts/DepositManager.json').abi;
const SeigManagerAbi = require('../build/contracts/SeigManager.json').abi;
const WTONAbi = require('../build/contracts/WTON.json').abi;

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
const TON_USER_STAKE_AMOUNT = _TON('10');
////////////////////////////////////////////////////////////////////////////////

const owner= defaultSender;
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

//
let noticePeriod, votingPeriod , agendaFee;
let layer2s=[];
let AbiObj, WTONAbiObj, DaoContractsDeployed ;


  describe('Agenda - seigManager', function () {

    before(async function () {
        this.timeout(1000000);

        await initializeContracts();

        await addlayer2s(operator1);
        await addlayer2s(operator2);

        await DaoContractsDeployed.addCandidate(candidate1);
        await DaoContractsDeployed.addCandidate(candidate2);
        await DaoContractsDeployed.addCandidate(candidate3);

        let layer2s = DaoContractsDeployed.getLayer2s();

        await layer2s[2].changeMember(0, {from: candidate1});
        await layer2s[3].changeMember(1, {from: candidate2});
        await layer2s[4].changeMember(2, {from: candidate3});

    });

    async function initializeContracts(){

        DaoContractsDeployed = new DaoContracts();
        AbiObject = await DaoContractsDeployed.setAbiObject();

        let returnData = await DaoContractsDeployed.initializePlasmaEvmContracts(owner);
        ton = returnData.ton;
        wton = returnData.wton;
        registry = returnData.registry;
        depositManager = returnData.depositManager;
        factory = returnData.coinageFactory;
        oldDaoVault = returnData.oldDaoVault;
        seigManager = returnData.seigManager;
        powerton = returnData.powerton;

        let returnData1 = await DaoContractsDeployed.initializeDaoContracts(owner);
        daoVault = returnData1.daoVault;
        agendaManager = returnData1.agendaManager;
        candidateFactory = returnData1.candidateFactory;
        committee = returnData1.committee;
        committeeProxy= returnData1.committeeProxy;

        await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
        await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
    }

    async function NewPowerTON(){
      let _powerton = await PowerTON.new(
        seigManager.address,
        wton.address,
        ROUND_DURATION,
      );
      await _powerton.init();
      await _powerton.start();

      return _powerton;
    }

    async function addlayer2s(operator){
      let _layer2 = await DaoContractsDeployed.addOperator(operator);
      layer2s.push(_layer2);
    }

    beforeEach(async function () {
      this.timeout(0);
    });

    it('seigManager.setPowerTON', async function () {
      this.timeout(1000000);
      let _powerton = await NewPowerTON();
      let params = [_powerton.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setPowerTON,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await seigManager.powerton()).to.equal(_powerton.address);

      let data = {
        seigManager: seigManager,
        ton: ton,
        wton: wton,
        powerton: _powerton,
        registry: registry,
        depositManager: depositManager,
        factory: factory,
      } ;
      await DaoContractsDeployed.setDaoContract(data);

    } );

    it('seigManager.setDao', async function () {
      this.timeout(1000000);
      let oldDaoVault = await DAOVault.new(ton.address, wton.address,{from:owner});
      let params = [oldDaoVault.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setDao,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await seigManager.dao()).to.equal(oldDaoVault.address);

    });

    it('seigManager.setPowerTONSeigRate setDaoSeigRate setPseigRate ', async function () {
      this.timeout(0);
      const POWERTON_SEIG_RATE_2 = _WTON('0.4');
      const DAO_SEIG_RATE_2 = _WTON('0.3');
      const PSEIG_RATE_2 = _WTON('0.3');
      let params1 = [POWERTON_SEIG_RATE_2.toFixed(WTON_UNIT)] ;
      let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setPowerTONSeigRate,params1);
      let params2 = [DAO_SEIG_RATE_2.toFixed(WTON_UNIT)] ;
      let functionBytecode2 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setDaoSeigRate,params2);
      let params3 = [PSEIG_RATE_2.toFixed(WTON_UNIT)] ;
      let functionBytecode3 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setPseigRate,params3);

      await DaoContractsDeployed.executeAgenda(
        [seigManager.address,seigManager.address,seigManager.address],
        [functionBytecode1, functionBytecode2, functionBytecode3] );

      let powerTonRate =  await seigManager.powerTONSeigRate();
      powerTonRate.should.be.bignumber.equal(toBN(POWERTON_SEIG_RATE_2.toFixed(WTON_UNIT)));
      let daoSeigRate =  await seigManager.daoSeigRate();
      daoSeigRate.should.be.bignumber.equal(toBN(DAO_SEIG_RATE_2.toFixed(WTON_UNIT)));
      let rSeigRate =  await seigManager.relativeSeigRate();
      rSeigRate.should.be.bignumber.equal(toBN(PSEIG_RATE_2.toFixed(WTON_UNIT)));

      await DaoContractsDeployed.setDaoContract({seigManager:seigManager}) ;
    });

    it('seigManager.setCoinageFactory', async function () {
      this.timeout(1000000);
      let _factory = await CoinageFactory.new({from:owner});
      let params = [_factory.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setCoinageFactory,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await seigManager.factory()).to.equal(_factory.address);
    });

    it('seigManager.setAdjustDelay', async function () {
      this.timeout(1000000);
      let params = [5] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setAdjustDelay,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      (await seigManager.adjustCommissionDelay()).should.be.bignumber.equal(toBN("5"));
    });

    it('seigManager.updateSeigniorage', async function () {
      this.timeout(1000000);
      let index=3;
      let layer2s = await DaoContractsDeployed.getLayer2s();
      await layer2s[index].updateSeigniorage();

    });

    it('seigManager.setMinimumAmount', async function () {
      this.timeout(1000000);
      const TON_MINIMUM_STAKE_AMOUNT2 = _TON('2000');
      (await seigManager.minimumAmount()).should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT));

      let params = [TON_MINIMUM_STAKE_AMOUNT2.times(WTON_TON_RATIO).toFixed(WTON_UNIT)] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setMinimumAmount,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      (await seigManager.minimumAmount()).should.be.bignumber.equal(toBN(TON_MINIMUM_STAKE_AMOUNT2.times(WTON_TON_RATIO).toFixed(WTON_UNIT)));
    });

    it('seigManager.renounceWTONMinter', async function () {
      this.timeout(0);
      expect(await wton.isMinter(seigManager.address)).to.equal(true);
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceWTONMinter,[]);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await wton.isMinter(seigManager.address)).to.equal(false);
      let params1 = [seigManager.address] ;
      let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.WTON.addMinter,params1);
      await DaoContractsDeployed.executeAgenda(wton.address, functionBytecode1);
      expect(await wton.isMinter(seigManager.address)).to.equal(true);
    });

    it('seigManager.transferOwnership(address)  ', async function () {
      this.timeout(1000000);
      expect(await seigManager.owner()).to.equal(committeeProxy.address);
      let params = [owner] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.transferOwnership2,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await seigManager.owner()).to.equal(owner);
      await seigManager.transferOwnership(committeeProxy.address);
      expect(await seigManager.owner()).to.equal(committeeProxy.address);
    });

    it('seigManager.transferOwnership(address,address)  ', async function () {
      this.timeout(1000000);
      expect(await seigManager.owner()).to.equal(committeeProxy.address);
      expect(await powerton.owner()).to.equal(committeeProxy.address);
      let params1 = [seigManager.address] ;
      let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.PowerTON.transferOwnership2,params1);
      await DaoContractsDeployed.executeAgenda(powerton.address, functionBytecode1 );

      let params = [powerton.address, owner] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.transferOwnership,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode );
      expect(await powerton.owner()).to.equal(owner);

      await powerton.transferOwnership(committeeProxy.address);
      expect(await powerton.owner()).to.equal(committeeProxy.address);
    });

    it('seigManager.addPauser', async function () {
      this.timeout(1000000);
      expect(await seigManager.isPauser(user1)).to.equal(false);
      let params = [user1] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.addPauser,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await seigManager.isPauser(user1)).to.equal(true);
    });

    it('seigManager.pause', async function () {
      expect(await seigManager.isPauser(committeeProxy.address)).to.equal(true);
      this.timeout(1000000);
      let pausedBlock = await seigManager.pausedBlock();
      let params = [] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.pause,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      let layer2s = await DaoContractsDeployed.getLayer2s();
      expect(layer2s.length).to.gt(0);
      await layer2s[layer2s.length-1].updateSeigniorage();
      let pausedBlockAfter = await seigManager.pausedBlock();
      pausedBlockAfter.should.be.bignumber.gt(pausedBlock);
    });

    it('seigManager.unpause', async function () {
      this.timeout(1000000);
      let pausedBlock = await seigManager.pausedBlock();
      let params = [] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.unpause,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      let unpausedBlockkAfter = await seigManager.unpausedBlock();
      unpausedBlockkAfter.should.be.bignumber.gt(pausedBlock);
    });

    it('seigManager.renouncePauser(address)', async function () {
      this.timeout(1000000);
      expect(await powerton.isPauser(committeeProxy.address)).to.equal(true);
      let params1 = [seigManager.address] ;
      let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.PowerTON.addPauser,params1);
      await DaoContractsDeployed.executeAgenda(powerton.address, functionBytecode1);
      expect(await powerton.isPauser(seigManager.address)).to.equal(true);
      let params = [powerton.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renouncePauser,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await powerton.isPauser(seigManager.address)).to.equal(false);
    });

    it('seigManager.renouncePauser()', async function () {
      this.timeout(1000000);
      expect(await seigManager.isPauser(committeeProxy.address)).to.equal(true);
      let params = [] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renouncePauser2,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await seigManager.isPauser(committeeProxy.address)).to.equal(false);
    });


    it('seigManager.renounceMinter', async function () {
      this.timeout(1000000);
      expect(await wton.isMinter(seigManager.address)).to.equal(true);
      let params = [wton.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceMinter,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await wton.isMinter(seigManager.address)).to.equal(false);
     });


    it('seigManager.renounceOwnership(address)', async function () {
      this.timeout(1000000);
      let params1 = [seigManager.address] ;
      let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.transferOwnership2,params1);
      let params = [powerton.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceOwnership,params);
      await DaoContractsDeployed.executeAgenda(
        [powerton.address, seigManager.address], [functionBytecode1,functionBytecode]);
      expect(await powerton.owner()).to.equal(ZERO_ADDRESS);

    });

    it('seigManager.renounceOwnership ', async function () {
      this.timeout(1000000);
      expect(await seigManager.owner()).to.equal(committeeProxy.address);
      let params = [] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceOwnership2,params);
      await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);
      expect(await seigManager.owner()).to.equal(ZERO_ADDRESS);
    });

    //addChallenger(address account)
    //renounceChallenger

    it('seigManager.transferCoinageOwnership - need to check ', async function () {
      // NewSeigManager
      // let _newSeigManager = await NewSeigManager();

      // DaoContractsDeployed.getCoinages()
      // DaoContractsDeployed.getLayer2s()
      //transferCoinageOwnership(address newSeigManager, address[] calldata coinages)

    });

  });
