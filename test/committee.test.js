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
  VOTER_INFO_VOTE,
  CANDIDATE_INFO_INDEX_CANDIDATE_CONTRACT,
  CANDIDATE_INFO_INDEX_MEMBER_JOINED_TIME,
  CANDIDATE_INFO_INDEX_MEMBER_INDEX,
  CANDIDATE_INFO_INDEX_REWARD_PERIOD
} = require('../utils/constants.js');

//const { deployPlasmaEvmContracts, deployDaoContracts } = require('./utils/deploy');
//const deployPlasmaEvmContracts = require('./utils/deploy.js');

// dao-contracts
const Candidate = contract.fromArtifact('Candidate');
const DAOVault = contract.fromArtifact('DAOVault');
const DAOCommittee = contract.fromArtifact('DAOCommittee');
//const DAOActivityRewardManager = contract.fromArtifact('DAOActivityRewardManager');
const DAOAgendaManager = contract.fromArtifact('DAOAgendaManager');
const CandidateFactory = contract.fromArtifact('CandidateFactory');
const DAOCommitteeProxy = contract.fromArtifact('DAOCommitteeProxy');
//const DAOElectionStore = contract.fromArtifact('DAOElectionStore');
//const DAOElection = contract.fromArtifact('DAOElection');
//const DAOElectionProxy = contract.fromArtifact('DAOElectionProxy');

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

let o;
process.on('exit', function () {
  console.log(o);
});

const [ candidate1, candidate2, candidate3, user1, user2, user3, user4,user5,user6] = accounts;
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

describe('DAOCommittee', function () {
  beforeEach(async function () {
    this.timeout(1000000);

    await initializePlasmaEvmContracts(); 
    await initializeDaoContracts();

    await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
    await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));  
    await ton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(TON_UNIT));
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
   
    //await this.daoCommitteeProxy.upgradeTo(committee.address);
    //await this.daoCommitteeProxy.setProxyAgendaManager(committee.address);
    //await this.daoCommitteeProxy.setProxyAactivityfeeManager(committee.address);
    //if(debugLog)  console.log('daoCommitteeProxy  set end :' ) ;

    let impl = await daoCommitteeProxy.implementation() ;

    committeeProxy = await DAOCommittee.at(daoCommitteeProxy.address);
    if(debugLog)  console.log('committeeProxy :', committeeProxy.address ) ;
     
    if(debugLog){
      console.log('dAOCommittee :', committee.address) ;
      console.log('daoCommitteeProxy :', this.daoCommitteeProxy.address) ;
      console.log('daoCommitteeProxy implementation :', impl) ;
    }

    await committeeProxy.increaseMaxMember(3, 2);

    ////////////////////////////////////////////////////////////////////////
    // test setting
    await committeeProxy.setActivityRewardPerSecond(toBN("1"));
    await agendaManager.setMinimumNoticePeriodSeconds(toBN("10000"));
    await agendaManager.setMinimumVotingPeriodSeconds(toBN("10000"));

    ////////////////////////////////////////////////////////////////////////

    await registry.transferOwnership(committeeProxy.address);
    await daoVault.transferOwnership(committeeProxy.address);
    await agendaManager.setCommittee(committeeProxy.address);
    await agendaManager.transferOwnership(committeeProxy.address);
    //await committee.transferOwnership(committeeProxy.address);
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

  async function addCandidateWithoutDeposit(candidate) {
    const minimum = await seigManager.minimumAmount();

    //await ton.approve(committeeProxy.address, stakeAmountTON, {from: candidate});
    //tmp = await ton.allowance(candidate, committeeProxy.address);
    //tmp.should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT));
    const testMemo = "candidate memo string";
    await committeeProxy.createCandidate(testMemo, {from: candidate});

    const candidateContractAddress = await committeeProxy.candidateContract(candidate);

    (await registry.layer2s(candidateContractAddress)).should.be.equal(true);

    return candidateContractAddress;
  }

  async function addCandidate(candidate) {
    const candidateContractAddress = await addCandidateWithoutDeposit(candidate);
    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    const beforeTonBalance = await ton.balanceOf(candidate);

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

  /*before(async function () { 
    this.timeout(1000000);
    await addCandidate(candidate1);
    await addCandidate(candidate2);
  });*/

  describe('Candidate', function () {
    const candidate = candidate1;

    beforeEach(async function () { 
      this.timeout(1000000);
      (await committeeProxy.isExistCandidate(candidate)).should.be.equal(false);
      await addCandidateWithoutDeposit(candidate);
      (await committeeProxy.isExistCandidate(candidate)).should.be.equal(true);
      (await totalBalanceOfCandidate(candidate)).should.be.bignumber.equal(toBN("0"));
    });

    it('can not add candidate again', async function () {
      (await committeeProxy.isExistCandidate(candidate)).should.be.equal(true);
      await expectRevert(
        committeeProxy.createCandidate(candidate, {from: candidate}),
        "DAOCommittee: candidate already registerd"
      );
    });

    it('can not update seigniorage', async function () {
      await expectRevert.unspecified(
        committeeProxy.updateSeigniorage(candidate)
      );

      await expectRevert.unspecified(
        committeeProxy.updateSeigniorages([candidate])
      );
    });

    it('can not deposit less than minimum', async function () {
      const minimum = (await seigManager.minimumAmount()).div(toBN("1000000000"));
      const candidateContractAddress = await committeeProxy.candidateContract(candidate);
      await expectRevert(
        deposit(candidateContractAddress, candidate, minimum.sub(toBN("1"))),
        "minimum amount is required"
      );
    });

    describe('after deposit', function () {
      beforeEach(async function () { 
        this.timeout(1000000);
        const minimum = await seigManager.minimumAmount();
        const minimumInTon = minimum.div(toBN("1000000000"));
        const candidateContractAddress = await committeeProxy.candidateContract(candidate);

        const beforeBalance = await totalBalanceOfCandidate(candidate);
        await deposit(candidateContractAddress, candidate, minimumInTon);
        const afterBalance = await totalBalanceOfCandidate(candidate);
        afterBalance.sub(beforeBalance).should.be.bignumber.equal(minimum);
      });

      it('can update seigniorage', async function () {
        const amountBefore = await totalBalanceOfCandidate(candidate);
        await committeeProxy.updateSeigniorage(candidate);

        const amountAfter = await totalBalanceOfCandidate(candidate);
        amountAfter.should.be.bignumber.gt(amountBefore);
      });
    });
  });

  async function getCandidateContract(candidate) {
    const contractAddress = await committeeProxy.candidateContract(candidate);
    return await Candidate.at(contractAddress);
  }

  describe('Member', function () {
    const candidate = candidate1;
    beforeEach(async function () { 
      this.timeout(1000000);
      await addCandidate(candidate);
    });

    describe('before being Member', function () {
      const testSlotIndex = 0;
      const otherCandidate = candidate2;

      beforeEach(async function () { 
        this.timeout(1000000);
        await addCandidate(otherCandidate);
        const otherCandidateContractAddress = await committeeProxy.candidateContract(otherCandidate);

        await deposit(otherCandidateContractAddress, otherCandidate, toBN("1"));
        const candidateContract = await getCandidateContract(otherCandidate);
        await candidateContract.changeMember(testSlotIndex, {from: otherCandidate});
      });

      it('can not challenge with lower balance', async function () {
        const otherCandidateBalance = await totalBalanceOfCandidate(otherCandidate);
        const candidateBalance = await totalBalanceOfCandidate(candidate);

        candidateBalance.should.be.bignumber.lt(otherCandidateBalance);

        const candidateContract = await getCandidateContract(candidate);
        await expectRevert(
          candidateContract.changeMember(testSlotIndex, {from: candidate}),
          "not enough amount"
        );
      });

      it('challenge', async function () {
        this.timeout(1000000);
        const candidateContractAddress = await committeeProxy.candidateContract(candidate);
        await deposit(candidateContractAddress, candidate, toBN("2"));

        const otherCandidateBalance = await totalBalanceOfCandidate(otherCandidate);
        const candidateBalance = await totalBalanceOfCandidate(candidate);

        candidateBalance.should.be.bignumber.gt(otherCandidateBalance);

        (await committeeProxy.members(testSlotIndex)).should.be.equal(otherCandidate);

        const candidateContract = await getCandidateContract(candidate);
        await candidateContract.changeMember(testSlotIndex, {from: candidate});

        (await committeeProxy.members(testSlotIndex)).should.be.equal(candidate);
      });
    });

    describe('after being Member', function () {
      const testSlotIndex = 0;
      beforeEach(async function () { 
        this.timeout(1000000);

        const candidateContract = await getCandidateContract(candidate);
        await candidateContract.changeMember(testSlotIndex, {from: candidate});
      });

      it('can not own two slots', async function () {
        (await committeeProxy.members(testSlotIndex)).should.be.equal(candidate);
        (await committeeProxy.members(1)).should.be.equal(ZERO_ADDRESS);
        const candidateContract = await getCandidateContract(candidate);
        expectRevert(
          candidateContract.changeMember(1, {from: candidate}),
          "DAOCommittee: already member"
        );
      });

      it('retire', async function () {
        (await committeeProxy.isExistCandidate(candidate)).should.be.equal(true);
        (await committeeProxy.members(testSlotIndex)).should.be.equal(candidate);
        const candidateContract = await getCandidateContract(candidate);
        await candidateContract.retireMember({from: candidate});
        (await committeeProxy.isExistCandidate(candidate)).should.be.equal(true);
        (await committeeProxy.members(testSlotIndex)).should.be.equal(ZERO_ADDRESS);
      });
    });
  });

  describe('Claim', function () {
    beforeEach(async function () { 
      this.timeout(1000000);
      await addCandidate(candidate1);
      await addCandidate(candidate2);
      await addCandidate(candidate3);
    });

    describe('before being member', function () {
      it('should have no claimable amount', async function () {
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const claimableAmount = await committeeProxy.getClaimableActivityReward(candidate);
          claimableAmount.should.be.bignumber.equal(toBN("0"));
        }
      });

      it('can not claim', async function () {
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const candidateContract = await getCandidateContract(candidate);
          await expectRevert(
            candidateContract.claimActivityReward({from: candidate}),
            "DAOCommittee: you don't have claimable ton"
          );
        }
      });
    });

    describe('after being member', function () {
      beforeEach(async function () { 
        this.timeout(1000000);
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const candidateContract = await getCandidateContract(candidate);
          await candidateContract.changeMember(i, {from: candidate});
        }

        await time.increase("10000");
      });

      it('should have claimable amount', async function () {
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const claimableAmount = await committeeProxy.getClaimableActivityReward(candidate);
          claimableAmount.should.be.bignumber.gt(toBN("0"));
        }
      });

      it('can claim', async function () {
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const candidateContract = await getCandidateContract(candidate);
          const balanceBefore = await ton.balanceOf(candidate);
          const claimableAmount = await committeeProxy.getClaimableActivityReward(candidate);
          claimableAmount.should.be.bignumber.gt(toBN("0"));
          await candidateContract.claimActivityReward({from: candidate});

          const balanceAfter = await ton.balanceOf(candidate);
          balanceAfter.sub(balanceBefore).should.be.bignumber.gte(claimableAmount);

          const claimableAmount2 = await committeeProxy.getClaimableActivityReward(candidate);
          claimableAmount2.should.be.bignumber.lt(claimableAmount);
        }
      });
    });
  });

  describe('Owner', function () {
    describe('set member count', function () {
      beforeEach(async function () { 
        this.timeout(1000000);
        await addCandidate(candidate1);
        await addCandidate(candidate2);
        await addCandidate(candidate3);

        const candidateContract1 = await getCandidateContract(candidate1);
        await candidateContract1.changeMember(0, {from: candidate1});
        const candidateContract2 = await getCandidateContract(candidate2);
        await candidateContract2.changeMember(1, {from: candidate2});
        const candidateContract3 = await getCandidateContract(candidate3);
        await candidateContract3.changeMember(2, {from: candidate3});
      });

      it('increase max member', async function () {
        const maxMember = await committeeProxy.maxMember();
        await committeeProxy.increaseMaxMember(maxMember.add(toBN("1")), 2);
        (await committeeProxy.maxMember()).should.be.bignumber.equal(maxMember.add(toBN("1")));
        (await committeeProxy.members(maxMember)).should.be.equal(ZERO_ADDRESS);
      });

      it('can not decrease max member using increaseMaxMember.', async function () {
        const maxMember = await committeeProxy.maxMember();
        await expectRevert(
          committeeProxy.increaseMaxMember(maxMember.sub(toBN("1")), 2),
          "DAOCommitteeStore: You have to call decreaseMaxMember to decrease"
        );
      });

      it('decrease max member. delete the first slot', async function () {
        const maxMember = await committeeProxy.maxMember();
        const reducingSlotIndex = toBN("0");
        const reducingMember = await committeeProxy.members(reducingSlotIndex);

        const reducingMemberInfoBefore = await committeeProxy.candidateInfos(reducingMember);
        reducingMemberInfoBefore[CANDIDATE_INFO_INDEX_MEMBER_INDEX].should.be.bignumber.equal(reducingSlotIndex);
        reducingMemberInfoBefore[CANDIDATE_INFO_INDEX_MEMBER_JOINED_TIME].should.be.bignumber.gt(toBN("0"));

        reducingMember.should.be.not.equal(ZERO_ADDRESS);
        await committeeProxy.decreaseMaxMember(reducingSlotIndex, 2);
        (await committeeProxy.members(reducingSlotIndex)).should.be.not.equal(reducingMember);
        (await committeeProxy.maxMember()).should.be.bignumber.equal(maxMember.sub(toBN("1")));

        const reducingMemberInfoAfter = await committeeProxy.candidateInfos(reducingMember);
        reducingMemberInfoAfter[CANDIDATE_INFO_INDEX_MEMBER_INDEX].should.be.bignumber.equal(toBN("0"));
        reducingMemberInfoAfter[CANDIDATE_INFO_INDEX_MEMBER_JOINED_TIME].should.be.bignumber.equal(toBN("0"));
      });

      it('decrease max member. delete the last slot', async function () {
        const maxMember = await committeeProxy.maxMember();
        const reducingSlotIndex = maxMember.sub(toBN("1"));
        const reducingMember = await committeeProxy.members(reducingSlotIndex);

        const reducingMemberInfoBefore = await committeeProxy.candidateInfos(reducingMember);
        reducingMemberInfoBefore[CANDIDATE_INFO_INDEX_MEMBER_INDEX].should.be.bignumber.equal(reducingSlotIndex);
        reducingMemberInfoBefore[CANDIDATE_INFO_INDEX_MEMBER_JOINED_TIME].should.be.bignumber.gt(toBN("0"));

        await committeeProxy.decreaseMaxMember(reducingSlotIndex, 2);
        (await committeeProxy.maxMember()).should.be.bignumber.equal(maxMember.sub(toBN("1")));

        const reducingMemberInfoAfter = await committeeProxy.candidateInfos(reducingMember);
        reducingMemberInfoAfter[CANDIDATE_INFO_INDEX_MEMBER_INDEX].should.be.bignumber.equal(toBN("0"));
        reducingMemberInfoAfter[CANDIDATE_INFO_INDEX_MEMBER_JOINED_TIME].should.be.bignumber.equal(toBN("0"));
      });
    });
  });
});
