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

const DaoContracts = require('../utils/plasma_test_deploy.js');

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
const AGENDA_INDEX_EXECUTABLE_LIMIT_TIMESTAMP = 5;
const AGENDA_INDEX_EXECUTED_TIMESTAMP = 6;
const AGENDA_INDEX_COUNTING_YES = 7;
const AGENDA_INDEX_COUNTING_NO = 8;
const AGENDA_INDEX_COUNTING_ABSTAIN = 9;
const AGENDA_INDEX_STATUS = 10;
const AGENDA_INDEX_RESULT = 11;
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

const AGENDA_RESULT_PENDING = 0;
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
let daoVault, committeeProxy, committee, activityRewardManager , agendaManager, candidateFactory;
let layer2s = []
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

let daoContractsDeployed ; 

describe('Test 1', function () {
  before(async function () {
    this.timeout(1000000);

    daoContractsDeployed = new DaoContracts(); 

    const returnData = await daoContractsDeployed.initializePlasmaEvmContracts(owner);
    ton = returnData.ton;
    wton = returnData.wton;
    registry = returnData.registry;
    depositManager = returnData.depositManager;
    factory = returnData.coinageFactory;
    oldDaoVault = returnData.oldDaoVault;
    seigManager = returnData.seigManager;
    powerton = returnData.powerton; 

    const returnData1 = await daoContractsDeployed.initializeDaoContracts(owner);
    daoVault = returnData1.daoVault;
    agendaManager = returnData1.agendaManager;
    candidateFactory = returnData1.candidateFactory;
    committee = returnData1.committee;
    committeeProxy= returnData1.committeeProxy; 

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
    //const minimum = await seigManager.minimumAmount();
    const minimum = await seigManager.minimumAmount();
    const beforeTonBalance = await ton.balanceOf(candidate);

    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    //await ton.approve(committeeProxy.address, stakeAmountTON, {from: candidate});
    //tmp = await ton.allowance(candidate, committeeProxy.address);
    //tmp.should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT));
    await committeeProxy.createCandidate(candidate, {from: candidate});

    const candidateContractAddress = await committeeProxy.candidateContract(candidate);

    //const testMemo = "candidate memo string";
    //const data = web3.eth.abi.encodeParameter("string", testMemo);

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
    //const minimum = await seigManager.minimumAmount();
    const minimum = await seigManager.minimumAmount();
    const beforeTonBalance = await ton.balanceOf(candidate);

    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    //await ton.approve(committeeProxy.address, stakeAmountTON, {from: candidate});
    //tmp = await ton.allowance(candidate, committeeProxy.address);
    //tmp.should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT));
    await committeeProxy.createCandidate(candidate, {from: candidate});

    const candidateContractAddress = await committeeProxy.candidateContract(candidate);

    //const testMemo = "candidate memo string";
    //const data = web3.eth.abi.encodeParameter("string", testMemo);

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
    layer2s.push(layer2.address);
    return layer2;
  }

  async function getCandidateContract(candidate) {
    const contractAddress = await committeeProxy.candidateContract(candidate);
    return await Candidate.at(contractAddress);
  }

  before(async function () { 
    this.timeout(1000000);
    await addCandidate(candidate1);
    await addCandidate(candidate2);
  });

  describe('Candidate', function () {
    it('create candidate', async function () {
      this.timeout(1000000);
      (await committeeProxy.isExistCandidate(candidate3)).should.be.equal(false);
      await addCandidate(candidate3);
      (await committeeProxy.isExistCandidate(candidate3)).should.be.equal(true);
    });

    it('isCandidateContract', async function () {
        const isCandidate = await committeeProxy.isCandidate(candidate3);
        isCandidate.should.be.equal(true);

        const candidateContractAddress = await committeeProxy.candidateContract(candidate3);
        const candidateContract = await Candidate.at(candidateContractAddress);
        (await candidateContract.isCandidateContract()).should.be.equal(true);
    });

    it('can not add candidate again', async function () {
      (await committeeProxy.isExistCandidate(candidate1)).should.be.equal(true);
      await expectRevert(
        committeeProxy.createCandidate(candidate1, {from: candidate1}),
        "DAOCommittee: candidate already registerd"
      );
      //await committeeProxy.createCandidate(candidate1, {from: candidate1});
    });

    it('delegate to candidate', async function () {
      const beforeBalance = await totalBalanceOfCandidate(candidate1);
      const candidateContractAddress = await committeeProxy.candidateContract(candidate1);
      const delegateTonAmount = _TON('10').toFixed(TON_UNIT);
      const delegateWtonAmount = _WTON('10').toFixed(WTON_UNIT);
      await deposit(candidateContractAddress, user1, delegateTonAmount);
      const afterBalance = await totalBalanceOfCandidate(candidate1);
      afterBalance.should.be.bignumber.gt(beforeBalance);
      afterBalance.sub(beforeBalance).should.be.bignumber.equal(delegateWtonAmount);
    });

    it('anybody can updateSeigniorage', async function () {
      await committeeProxy.updateSeigniorage(candidate1, {from: user2})
    });

    it('anybody can updateSeigniorages', async function () {
      var candidates = [candidate1,candidate2,candidate3];
      await committeeProxy.updateSeigniorages(candidates, {from: user2})
    });

    it('can not updateSeigniorage on candidate without operator deposits', async function () {
      (await committeeProxy.isExistCandidate(candidate4)).should.be.equal(false);
      await addCandidateWithoutDeposit(candidate4); 
      (await committeeProxy.isExistCandidate(candidate4)).should.be.equal(true); 
      await expectRevert.unspecified(
        committeeProxy.updateSeigniorage(candidate4, {from: user1}) 
      );
    });

    describe('operator as a candidate', async function () {
      let layer2;
      it('register on Committee', async function () {
        (await committeeProxy.isExistCandidate(user1)).should.be.equal(false);

        layer2 = await addOperator(user1);
        layer2.should.be.not.equal(ZERO_ADDRESS);
         
        await committeeProxy.registerLayer2Candidate(layer2.address, "memo", {from: user1});

        (await committeeProxy.isExistCandidate(layer2.address)).should.be.equal(true);
        const candidateInfo = await committeeProxy.candidateInfos(layer2.address);
        //candidateInfo[CANDIDATE_INFO_INDEX_CANDIDATE_CONTRACT].should.be.equal(layer2.address);
      });

      it('isCandidateContract', async function () {
          const isCandidate = await committeeProxy.isCandidate(user1);
          isCandidate.should.be.equal(false);

          const candidateContractAddress = await committeeProxy.candidateContract(layer2.address);
          const candidateContract = await Candidate.at(candidateContractAddress);
          (await candidateContract.isCandidateContract()).should.be.equal(true);
      });

      it('can not updateSeigniorage on Committee', async function () {
        await expectRevert(
          committeeProxy.updateSeigniorage(layer2.address, {from: user1}),
          "Candidate: you should update seigniorage from layer2 contract"
        );
      });

      it('register on Committee by owner', async function () {
        (await committeeProxy.isExistCandidate(user2)).should.be.equal(false);

        layer2 = await addOperator(user2);
        layer2.should.be.not.equal(ZERO_ADDRESS);

        (await layer2.operator()).should.be.equal(user2);
        await committeeProxy.registerLayer2CandidateByOwner(user2, layer2.address, "memo");

        (await committeeProxy.isExistCandidate(layer2.address)).should.be.equal(true);
        const candidateInfo = await committeeProxy.candidateInfos(layer2.address);
        //candidateInfo[CANDIDATE_INFO_INDEX_CANDIDATE_CONTRACT].should.be.equal(layer2.address);
      });

      it('isCandidateContract', async function () {
          const isCandidate = await committeeProxy.isCandidate(user2);
          isCandidate.should.be.equal(false);

          const candidateContractAddress = await committeeProxy.candidateContract(layer2.address);
          const candidateContract = await Candidate.at(candidateContractAddress);
          (await candidateContract.isCandidateContract()).should.be.equal(true);
      });

      it('can not updateSeigniorage on Committee', async function () {
        await expectRevert(
          committeeProxy.updateSeigniorage(layer2.address, {from: user2}),
          "Candidate: you should update seigniorage from layer2 contract"
        );
      });
 
    });
  });

  describe('Member - CRUD(including challenge)', function () {
    it('challenge on empty slot', async function () {
      (await committeeProxy.isExistCandidate(candidate1)).should.be.equal(true);
      const slotIndex = 0;
      (await committeeProxy.members(slotIndex)).should.be.equal(ZERO_ADDRESS);
      const candidateContract = await getCandidateContract(candidate1);
      await candidateContract.changeMember(slotIndex, {from: candidate1});
      (await committeeProxy.members(slotIndex)).should.be.equal(candidate1);
    });

    it('should fail to challenge with lower balance', async function () {
      const candidateContractAddress = await committeeProxy.candidateContract(candidate2);
      (await committeeProxy.totalSupplyOnCandidate(candidate2)).should.be.bignumber.lt(
        await committeeProxy.totalSupplyOnCandidate(candidate1)
      );

      const slotIndex = 0;
      const candidateContract1 = await getCandidateContract(candidate1);
      (await committeeProxy.members(slotIndex)).should.be.equal(candidate1);
      const candidateContract2 = await getCandidateContract(candidate2);
      expectRevert(
        candidateContract2.changeMember(slotIndex, {from: candidate2}),
        "not enough amount"
      );
    });

    it('should fail to own two slots', async function () {
      const candidateContract1 = await getCandidateContract(candidate1);
      (await committeeProxy.members(0)).should.be.equal(candidate1);
      (await committeeProxy.members(1)).should.be.equal(ZERO_ADDRESS);
      const candidateContract = await getCandidateContract(candidate1);
      expectRevert(
        candidateContract.changeMember(1, {from: candidate1}),
        "DAOCommittee: already member"
      );
    });

    it('challenge on exist slot', async function () {
      const candidateContractAddress = await committeeProxy.candidateContract(candidate2);
      await deposit(candidateContractAddress, user1, _TON('100').toFixed(TON_UNIT));
      (await committeeProxy.totalSupplyOnCandidate(candidate2)).should.be.bignumber.gt(
        await committeeProxy.totalSupplyOnCandidate(candidate1)
      );

      const slotIndex = 0;
      const candidateContract1 = await getCandidateContract(candidate1);
      (await committeeProxy.members(slotIndex)).should.be.equal(candidate1);
      const candidateContract = await getCandidateContract(candidate2);
      await candidateContract.changeMember(slotIndex, {from: candidate2});
      (await committeeProxy.members(slotIndex)).should.be.equal(candidate2);
    });

    it('retire', async function () {
      (await committeeProxy.isExistCandidate(candidate2)).should.be.equal(true);
      const slotIndex = 0;
      const candidateContract2 = await getCandidateContract(candidate2);
      (await committeeProxy.members(slotIndex)).should.be.equal(candidate2);
      await candidateContract2.retireMember({from: candidate2});
      (await committeeProxy.isExistCandidate(candidate2)).should.be.equal(true);
      (await committeeProxy.members(slotIndex)).should.be.equal(ZERO_ADDRESS);
    });

    describe('member slot', function () {
      it('fill all slots', async function () {
        (await committeeProxy.maxMember()).should.be.bignumber.equal(toBN('3'));
        (await committeeProxy.members(0)).should.be.equal(ZERO_ADDRESS);
        (await committeeProxy.members(1)).should.be.equal(ZERO_ADDRESS);
        (await committeeProxy.members(2)).should.be.equal(ZERO_ADDRESS);

        const candidateContract1 = await getCandidateContract(candidate1);
        await candidateContract1.changeMember(0, {from: candidate1});
        const candidateContract2 = await getCandidateContract(candidate2);
        await candidateContract2.changeMember(1, {from: candidate2});
        const candidateContract3 = await getCandidateContract(candidate3);
        await candidateContract3.changeMember(2, {from: candidate3});

        (await committeeProxy.members(0)).should.be.equal(candidate1);
        (await committeeProxy.members(1)).should.be.equal(candidate2);
        (await committeeProxy.members(2)).should.be.equal(candidate3);
      });

      it('can not exceed maximum', async function () {
        (await committeeProxy.maxMember()).should.be.bignumber.equal(toBN('3'));
        const candidateContract = await getCandidateContract(candidate2);
        expectRevert(
          candidateContract.changeMember(3, {from: candidate2}),
          "DAOCommittee: invalid member index"
        );
      });

      it('increase maximum', async function () {
        (await committeeProxy.maxMember()).should.be.bignumber.equal(toBN('3'));
        await committeeProxy.increaseMaxMember(4, 3);
        (await committeeProxy.maxMember()).should.be.bignumber.equal(toBN('4'));
        (await committeeProxy.members(3)).should.be.equal(ZERO_ADDRESS);
      });

      it('decrease maximum', async function () {
        (await committeeProxy.maxMember()).should.be.bignumber.equal(toBN('4'));
        (await committeeProxy.members(3)).should.be.equal(ZERO_ADDRESS);
        await committeeProxy.decreaseMaxMember(3, 2);
        (await committeeProxy.maxMember()).should.be.bignumber.equal(toBN('3'));
      });
    });
  });

  describe('Member - Behavior', function () {
    it('update seigniorage', async function () {
      const candidateContract1 = await getCandidateContract(candidate1);
      (await committeeProxy.members(0)).should.be.equal(candidate1);
      const beforeBalance = await totalBalanceOfCandidate(candidate1);
      await committeeProxy.updateSeigniorage(candidate1);
      const afterBalance = await totalBalanceOfCandidate(candidate1);

      afterBalance.should.be.bignumber.gt(beforeBalance);
    });
  });

  describe('Quorum', function () {
    it('quorum must exceed half of maxMember', async function () {
        (await committeeProxy.maxMember()).should.be.bignumber.gt(toBN("2"));
        await expectRevert(
          committeeProxy.setQuorum(1),
          "DAOCommittee: invalid quorum"
        );
    });
  });

  describe('Agenda behavior', function () {
    describe('Create', function () {
      const votesList = [
        {
          "votes": [VOTE_ABSTAIN, VOTE_ABSTAIN, VOTE_ABSTAIN],
          "expected_result": AGENDA_RESULT_DISMISSED,
          "expected_status": AGENDA_STATUS_ENDED
        }, {
          "votes": [VOTE_ABSTAIN, VOTE_YES, VOTE_YES],
          "expected_result": AGENDA_RESULT_ACCEPTED,
          "expected_status": AGENDA_STATUS_WAITING_EXEC
        }, {
          "votes": [VOTE_ABSTAIN, VOTE_YES, VOTE_NO],
          "expected_result": AGENDA_RESULT_DISMISSED,
          "expected_status": AGENDA_STATUS_ENDED
        }, {
          "votes": [VOTE_ABSTAIN, VOTE_NO, VOTE_ABSTAIN],
          "expected_result": AGENDA_RESULT_DISMISSED,
          "expected_status": AGENDA_STATUS_ENDED
        }, {
          "votes": [VOTE_YES, VOTE_YES, VOTE_ABSTAIN],
          "expected_result": AGENDA_RESULT_ACCEPTED,
          "expected_status": AGENDA_STATUS_WAITING_EXEC
        }, {
          "votes": [VOTE_YES, VOTE_NO, VOTE_NO],
          "expected_result": AGENDA_RESULT_REJECTED,
          "expected_status": AGENDA_STATUS_ENDED
        }, {
          "votes": [VOTE_NO, VOTE_NO, VOTE_ABSTAIN],
          "expected_result": AGENDA_RESULT_REJECTED,
          "expected_status": AGENDA_STATUS_ENDED
        }
      ]
      let agendaID;

      async function isVoter(_agendaID, voter) {
        const candidateContract = await getCandidateContract(voter);
        const agenda = await agendaManager.agendas(_agendaID);

        if (agenda[AGENDA_INDEX_STATUS] == AGENDA_STATUS_NOTICE)
          return (await committeeProxy.isMember(voter));
        else
          return (await agendaManager.isVoter(_agendaID, voter));
      }

      async function castVote(_agendaID, voter, _vote) {
        const agenda1 = await agendaManager.agendas(_agendaID);
        const beforeCountingYes = agenda1[AGENDA_INDEX_COUNTING_YES];
        const beforeCountingNo = agenda1[AGENDA_INDEX_COUNTING_NO];
        const beforeCountingAbstain = agenda1[AGENDA_INDEX_COUNTING_ABSTAIN];

        (await isVoter(_agendaID, voter)).should.be.equal(true);

        await expectRevert.unspecified(
          committeeProxy.endAgendaVoting(_agendaID)
        );

        const candidateContract = await getCandidateContract(voter);
        await candidateContract.castVote(_agendaID, _vote, "test comment", {from: voter});

        const voterInfo2 = await agendaManager.voterInfos(_agendaID, voter);
        voterInfo2[VOTER_INFO_ISVOTER].should.be.equal(true);
        voterInfo2[VOTER_INFO_HAS_VOTED].should.be.equal(true);
        voterInfo2[VOTER_INFO_VOTE].should.be.bignumber.equal(toBN(_vote));

        const agenda2 = await agendaManager.agendas(_agendaID);
        agenda2[AGENDA_INDEX_COUNTING_YES].should.be.bignumber.equal(toBN(beforeCountingYes).add(_vote === VOTE_YES ? toBN(1) : toBN(0)));
        agenda2[AGENDA_INDEX_COUNTING_NO].should.be.bignumber.equal(toBN(beforeCountingNo).add(_vote === VOTE_NO ? toBN(1) : toBN(0)));
        agenda2[AGENDA_INDEX_COUNTING_ABSTAIN].should.be.bignumber.equal(toBN(beforeCountingAbstain).add(_vote === VOTE_ABSTAIN ? toBN(1) : toBN(0)));

        const result = await agendaManager.getVoteStatus(_agendaID, voter);
        result[0].should.be.equal(true);
        result[1].should.be.bignumber.equal(toBN(_vote));
      }

      for (let i = 0; i < votesList.length; i++) {
        describe(`Agenda ${i}`, async function () {
          it('create new agenda', async function () {
            const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
            const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();
            const selector = web3.eth.abi.encodeFunctionSignature("setMinimumNoticePeriodSeconds(uint256)");
            const newMinimumNoticePeriod = i * 10;
            const data = padLeft(newMinimumNoticePeriod.toString(16), 64);
            const functionBytecode = selector.concat(data);

            const param = web3.eth.abi.encodeParameters(
              ["address[]", "uint128", "uint128", "bool", "bytes[]"],
              [[agendaManager.address], noticePeriod.toString(), votingPeriod.toString(), true, [functionBytecode]]
            );

            const beforeBalance = await ton.balanceOf(user1);
            const agendaFee = await agendaManager.createAgendaFees();
            agendaFee.should.be.bignumber.gt(toBN("0"));

            // create agenda
            await ton.approveAndCall(
              committeeProxy.address,
              agendaFee,
              param,
              {from: user1}
            );
            const afterBalance = await ton.balanceOf(user1);
            afterBalance.should.be.bignumber.lt(beforeBalance);
            beforeBalance.sub(afterBalance).should.be.bignumber.equal(agendaFee);

            agendaID = (await agendaManager.numAgendas()).sub(toBN("1"));
            //const executionInfo = await agendaManager.executionInfos(agendaID);
            const executionInfo = await agendaManager.getExecutionInfo(agendaID);
            executionInfo[0][0].should.be.equal(agendaManager.address);
            executionInfo[1][0].should.be.equal(functionBytecode);
          });

          it('increase block time and check votable', async function () {
            const agenda = await agendaManager.agendas(agendaID);  
            const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP];
            await time.increaseTo(noticeEndTimestamp);
            (await agendaManager.isVotableStatus(agendaID)).should.be.equal(true);
          });

          /*it('check voters', async function () {
            const voters = await agendaManager.getVoters(agendaID);
            voters[0].should.be.equal(candidate1);
            voters[1].should.be.equal(candidate2);
            voters[2].should.be.equal(candidate3);

            for (let j = 0; j < voters.length; j++) {
              const voterInfo = await agendaManager.voterInfos(agendaID, voters[j]);
              voterInfo[0].should.be.equal(true);
              voterInfo[1].should.be.equal(false);
            }
          });*/

          describe(`Vote - ${votesList[i].votes}`, function () {
            it(`cast vote`, async function () {
              for (let j = 0; j < votesList[i].votes.length; j++) {
                await castVote(agendaID, candidates[j], votesList[i].votes[j]);
              }
            });

            it("check vote result/status", async function () {
              const agenda = await agendaManager.agendas(agendaID);
              agenda[AGENDA_INDEX_RESULT].should.be.bignumber.equal(toBN(votesList[i].expected_result));
              agenda[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(votesList[i].expected_status));

              if (agenda[AGENDA_INDEX_STATUS] == AGENDA_STATUS_WAITING_EXEC) {
                const votingEndTimestamp = agenda[AGENDA_INDEX_VOTING_END_TIMESTAMP];
                const currentTime = await time.latest();
                if (currentTime < votingEndTimestamp) {
                  await time.increaseTo(votingEndTimestamp);
                }
                (await agendaManager.canExecuteAgenda(agendaID)).should.be.equal(true);
              }
            });

            it("execute", async function () {
              const agenda = await agendaManager.agendas(agendaID);
              agenda[AGENDA_INDEX_EXECUTED_TIMESTAMP].should.be.bignumber.equal(toBN("0"));

              if (agenda[AGENDA_INDEX_STATUS] == AGENDA_STATUS_WAITING_EXEC) {
                const beforeValue = await agendaManager.minimumNoticePeriodSeconds();
                await committeeProxy.executeAgenda(agendaID);
                const afterValue = await agendaManager.minimumNoticePeriodSeconds();
                beforeValue.should.be.bignumber.not.equal(afterValue);
                afterValue.should.be.bignumber.equal(toBN(agendaID * 10));

                const afterAgenda = await agendaManager.agendas(agendaID); 
                afterAgenda[AGENDA_INDEX_EXECUTED].should.be.equal(true);
                afterAgenda[AGENDA_INDEX_EXECUTED_TIMESTAMP].should.be.bignumber.gt(toBN("0")); 
              }
            });
          });
        });
      }

      describe("dismiss agenda", async function () {
        let agendaID;
        it('create new agenda', async function () {
          const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
          const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();
          const selector = web3.eth.abi.encodeFunctionSignature("setMinimumNoticePeriodSeconds(uint256)");
          const newMinimumNoticePeriod = 10;
          const data = padLeft(newMinimumNoticePeriod.toString(16), 64);
          const functionBytecode = selector.concat(data);

          const param = web3.eth.abi.encodeParameters(
            ["address[]", "uint128", "uint128", "bool", "bytes[]"],
            [[agendaManager.address], noticePeriod.toString(), votingPeriod.toString(), true, [functionBytecode]]
          );

          const beforeBalance = await ton.balanceOf(user1);
          const agendaFee = await agendaManager.createAgendaFees();
          agendaFee.should.be.bignumber.gt(toBN("0"));

          // create agenda
          await ton.approveAndCall(
            committeeProxy.address,
            agendaFee,
            param,
            {from: user1}
          );
          const afterBalance = await ton.balanceOf(user1);
          afterBalance.should.be.bignumber.lt(beforeBalance);
          beforeBalance.sub(afterBalance).should.be.bignumber.equal(agendaFee);

          agendaID = (await agendaManager.numAgendas()).sub(toBN("1"));
          //const executionInfo = await agendaManager.executionInfos(agendaID);
          const executionInfo = await agendaManager.getExecutionInfo(agendaID);
          executionInfo[0][0].should.be.equal(agendaManager.address);
          executionInfo[1][0].should.be.equal(functionBytecode);
        });

        it('increase block time and check votable', async function () {
          const agenda = await agendaManager.agendas(agendaID);  
          const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP];
          await time.increaseTo(noticeEndTimestamp);
          (await agendaManager.isVotableStatus(agendaID)).should.be.equal(true);
        });

        it(`cast vote`, async function () {
          await castVote(agendaID, candidates[0], VOTE_YES);
        });

        it("check vote result/status", async function () {
          const agenda = await agendaManager.agendas(agendaID);
          agenda[AGENDA_INDEX_RESULT].should.be.bignumber.equal(toBN(AGENDA_RESULT_PENDING));
          agenda[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_VOTING));
        });

        it('increase block time', async function () {
          const agenda = await agendaManager.agendas(agendaID);  
          const noticeEndTimestamp = agenda[AGENDA_INDEX_VOTING_END_TIMESTAMP];
          await time.increaseTo(toBN(noticeEndTimestamp).add(toBN("1")));
          (await agendaManager.isVotableStatus(agendaID)).should.be.equal(false);
        });

        it("end agenda voting", async function () {
          await committeeProxy.endAgendaVoting(agendaID);
        });

        it("check vote result/status", async function () {
          const agenda = await agendaManager.agendas(agendaID);
          agenda[AGENDA_INDEX_RESULT].should.be.bignumber.equal(toBN(AGENDA_RESULT_DISMISSED));
          agenda[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_ENDED));
          (await agendaManager.isVotableStatus(agendaID)).should.be.equal(false);
        });
      });

      describe("non-atomic agenda", async function () {
        let agendaID;
        it('create new agenda', async function () {
          const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
          const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();

          let targets = [];
          let functionBytecodes = [];
          for (let i = 0; i < 10; i++) {
            const selector1 = web3.eth.abi.encodeFunctionSignature("setMinimumNoticePeriodSeconds(uint256)");
            const newMinimumNoticePeriod = 1000000 * (i+1);
            const data1 = padLeft(newMinimumNoticePeriod.toString(16), 64);
            const functionBytecode1 = selector1.concat(data1);
            targets.push(agendaManager.address);
            functionBytecodes.push(functionBytecode1);
          }

          const param = web3.eth.abi.encodeParameters(
            ["address[]", "uint128", "uint128", "bool", "bytes[]"],
            [targets, 
                noticePeriod.toString(),
                votingPeriod.toString(),
                false,
                functionBytecodes
            ]
          );

          const beforeBalance = await ton.balanceOf(user1);
          const agendaFee = await agendaManager.createAgendaFees();
          agendaFee.should.be.bignumber.gt(toBN("0"));

          // create agenda
          await ton.approveAndCall(
            committeeProxy.address,
            agendaFee,
            param,
            {from: user1}
          );
          const afterBalance = await ton.balanceOf(user1);
          afterBalance.should.be.bignumber.lt(beforeBalance);
          beforeBalance.sub(afterBalance).should.be.bignumber.equal(agendaFee);

          agendaID = (await agendaManager.numAgendas()).sub(toBN("1"));
          //const executionInfo = await agendaManager.executionInfos(agendaID);
          const executionInfo = await agendaManager.getExecutionInfo(agendaID);
          //executionInfo[0][0].should.be.equal(agendaManager.address);
          //executionInfo[1][0].should.be.equal(functionBytecode1);
        });

        it('increase block time and check votable', async function () {
          const agenda = await agendaManager.agendas(agendaID);  
          const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP];
          await time.increaseTo(noticeEndTimestamp);
          (await agendaManager.isVotableStatus(agendaID)).should.be.equal(true);
        });

        it(`cast vote`, async function () {
          await castVote(agendaID, candidates[0], VOTE_YES);
          await castVote(agendaID, candidates[1], VOTE_YES);
        });

        it("check vote result/status", async function () {
          const agenda = await agendaManager.agendas(agendaID);
          agenda[AGENDA_INDEX_RESULT].should.be.bignumber.equal(toBN(AGENDA_RESULT_ACCEPTED));
          agenda[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_WAITING_EXEC));
        });

        it('increase block time', async function () {
          const agenda = await agendaManager.agendas(agendaID);  
          const noticeEndTimestamp = agenda[AGENDA_INDEX_VOTING_END_TIMESTAMP];
          await time.increaseTo(toBN(noticeEndTimestamp).add(toBN("1")));
          (await agendaManager.isVotableStatus(agendaID)).should.be.equal(false);
        });

        it("execute", async function () {
          const beforeValue = await agendaManager.minimumNoticePeriodSeconds();
          const executeTx = await committeeProxy.executeAgenda(agendaID, {gas: 180000});
          const afterValue = await agendaManager.minimumNoticePeriodSeconds();
          beforeValue.should.be.bignumber.not.equal(afterValue);

          const afterAgenda = await agendaManager.agendas(agendaID); 
          afterAgenda[AGENDA_INDEX_EXECUTED].should.be.equal(false);
          //afterAgenda[AGENDA_INDEX_EXECUTED_TIMESTAMP].should.be.bignumber.gt(toBN("0")); 
        });

        it("check executed result/status", async function () {
          const executedInfo = await agendaManager.getExecutionInfo(agendaID);
          toBN(executedInfo.executeStartFrom).should.be.bignumber.lt(toBN("10"));
          (await agendaManager.minimumNoticePeriodSeconds()).should.be.bignumber.lt(toBN("10000000"));
        });

        it("execute again", async function () {
          const beforeValue = await agendaManager.minimumNoticePeriodSeconds();
          const executeTx = await committeeProxy.executeAgenda(agendaID, {gas: 180000});
          const afterValue = await agendaManager.minimumNoticePeriodSeconds();
          beforeValue.should.be.bignumber.not.equal(afterValue);

          const afterAgenda = await agendaManager.agendas(agendaID); 
          const test = await agendaManager.getExecutionInfo(agendaID);
          afterAgenda[AGENDA_INDEX_EXECUTED].should.be.equal(true);
          afterAgenda[AGENDA_INDEX_EXECUTED_TIMESTAMP].should.be.bignumber.gt(toBN("0")); 
        });

        it("check executed result/status", async function () {
          const executedInfo = await agendaManager.getExecutionInfo(agendaID);
          toBN(executedInfo.executeStartFrom).should.be.bignumber.equal(toBN("10"));
          (await agendaManager.minimumNoticePeriodSeconds()).should.be.bignumber.equal(toBN("10000000"));
        });
      });

      describe("executing period of agenda", async function () {
        let agendaID;
        it('create new agenda', async function () {
          const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
          const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();
          const selector = web3.eth.abi.encodeFunctionSignature("setMinimumNoticePeriodSeconds(uint256)");
          const newMinimumNoticePeriod = 20;
          const data = padLeft(newMinimumNoticePeriod.toString(16), 64);
          const functionBytecode = selector.concat(data);

          const param = web3.eth.abi.encodeParameters(
            ["address[]", "uint128", "uint128", "bool", "bytes[]"],
            [[agendaManager.address], noticePeriod.toString(), votingPeriod.toString(), true, [functionBytecode]]
          );

          const beforeBalance = await ton.balanceOf(user1);
          const agendaFee = await agendaManager.createAgendaFees();
          agendaFee.should.be.bignumber.gt(toBN("0"));

          // create agenda
          await ton.approveAndCall(
            committeeProxy.address,
            agendaFee,
            param,
            {from: user1}
          );
          const afterBalance = await ton.balanceOf(user1);
          afterBalance.should.be.bignumber.lt(beforeBalance);
          beforeBalance.sub(afterBalance).should.be.bignumber.equal(agendaFee);

          agendaID = (await agendaManager.numAgendas()).sub(toBN("1"));
          //const executionInfo = await agendaManager.executionInfos(agendaID);
          const executionInfo = await agendaManager.getExecutionInfo(agendaID);
          executionInfo[0][0].should.be.equal(agendaManager.address);
          executionInfo[1][0].should.be.equal(functionBytecode);
        });

        it('increase block time and check votable', async function () {
          const agenda = await agendaManager.agendas(agendaID);  
          const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP];
          await time.increaseTo(noticeEndTimestamp);
          (await agendaManager.isVotableStatus(agendaID)).should.be.equal(true);
        });

        it(`cast vote`, async function () {
          await castVote(agendaID, candidates[0], VOTE_YES);
          await castVote(agendaID, candidates[1], VOTE_YES);
          await castVote(agendaID, candidates[2], VOTE_YES);
        });

        it("check vote result/status", async function () {
          const agenda = await agendaManager.agendas(agendaID);
          agenda[AGENDA_INDEX_RESULT].should.be.bignumber.equal(toBN(AGENDA_RESULT_ACCEPTED));
          agenda[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_WAITING_EXEC));
          (await time.latest()).should.be.bignumber.lt(agenda[AGENDA_INDEX_VOTING_END_TIMESTAMP]);
          (await agendaManager.canExecuteAgenda(agendaID)).should.be.equal(false);
        });

        it('increase block time', async function () {
          const agenda = await agendaManager.agendas(agendaID);  

          const votingEndTimestamp = agenda[AGENDA_INDEX_VOTING_END_TIMESTAMP];
          await time.increaseTo(toBN(votingEndTimestamp).add(toBN("1")));

          (await agendaManager.canExecuteAgenda(agendaID)).should.be.equal(true);

          const executableLimitTimestamp = agenda[AGENDA_INDEX_EXECUTABLE_LIMIT_TIMESTAMP];
          await time.increaseTo(toBN(executableLimitTimestamp).add(toBN("1")));
        });

        it("check executable limit", async function () {
          const agenda = await agendaManager.agendas(agendaID);  

          (await agendaManager.isVotableStatus(agendaID)).should.be.equal(false);
          (await time.latest()).should.be.bignumber.gt(agenda[AGENDA_INDEX_EXECUTABLE_LIMIT_TIMESTAMP]);
          (await agendaManager.canExecuteAgenda(agendaID)).should.be.equal(false);
          await expectRevert(
            committeeProxy.executeAgenda(agendaID),
            "DAOCommittee: can not execute the agenda"
          );
        });
      });
    });
  });

  describe('Vault', function () {
    it('claim from OldDAOVaultMock', async function () {
      let amount = await wton.balanceOf(oldDaoVault.address);
      amount.should.be.bignumber.gt(toBN('0'));
      beforeBalance = await wton.balanceOf(daoVault.address);
      console.log(`beforeBalance: ${beforeBalance}`);
      const owner = await oldDaoVault.owner();
      currentTime = await time.latest();
      await oldDaoVault.claim(daoVault.address);
      afterBalance = await ton.balanceOf(daoVault.address);
      console.log(`afterBalance: ${afterBalance}`);

      amount = await wton.balanceOf(oldDaoVault.address);
      amount.should.be.bignumber.equal(toBN('0'));
    });

    describe('Claim activity reward', function () {
      it('dao candidate', async function () {
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const candidateContract = await getCandidateContract(candidate);
          const beforeBalance = await ton.balanceOf(candidate);

          const fee = await committeeProxy.activityRewardPerSecond();

          const beforeBalanceTV = await ton.balanceOf(daoVault.address);
          const beforeBalanceWV = await wton.balanceOf(daoVault.address);

          const claimableAmount = await committeeProxy.getClaimableActivityReward(candidate);
          claimableAmount.should.be.bignumber.gt(toBN("0"));

          await candidateContract.claimActivityReward({from: candidate});

          const afterBalanceTV = await ton.balanceOf(daoVault.address);
          const afterBalanceWV = await wton.balanceOf(daoVault.address);

          const afterBalance = await ton.balanceOf(candidate);
          afterBalance.sub(beforeBalance).should.be.bignumber.gte(claimableAmount);
          
          const claimableAfterAmount = await committeeProxy.getClaimableActivityReward(candidate);
          claimableAfterAmount.should.be.bignumber.equal(toBN("0")); 
        }
      });

      it('operator', async function () {
        const operator = user1;
        const layer2 = layer2s[0];
        const candidateContract = await getCandidateContract(layer2);

        await deposit(layer2, operator, _TON("9999").toFixed(TON_UNIT));
        await candidateContract.changeMember(0, {from: operator});
        await time.increase(10000);

        const beforeBalance = await ton.balanceOf(operator);

        const fee = await committeeProxy.activityRewardPerSecond();

        const beforeBalanceTV = await ton.balanceOf(daoVault.address);
        const beforeBalanceWV = await wton.balanceOf(daoVault.address);

        const claimableAmount = await committeeProxy.getClaimableActivityReward(layer2s[0]);
        claimableAmount.should.be.bignumber.gt(toBN("0"));

        await candidateContract.claimActivityReward({from: operator});

        const afterBalanceTV = await ton.balanceOf(daoVault.address);
        const afterBalanceWV = await wton.balanceOf(daoVault.address);

        const afterBalance = await ton.balanceOf(operator);
        afterBalance.sub(beforeBalance).should.be.bignumber.gte(claimableAmount);
        
        const claimableAfterAmount = await committeeProxy.getClaimableActivityReward(layer2s[0]);
        claimableAfterAmount.should.be.bignumber.equal(toBN("0")); 
      });
    });
  });
});
