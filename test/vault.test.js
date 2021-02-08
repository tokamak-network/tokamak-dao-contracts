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

//const { deployPlasmaEvmContracts, deployDaoContracts } = require('./utils/deploy');
//const deployPlasmaEvmContracts = require('./utils/deploy.js');

// dao-contracts
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

/*const AGENDA_INDEX_CREATED_TIMESTAMP = 0;
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

describe('DAOVault', function () {
  beforeEach(async function () {
    this.timeout(1000000);

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

    await committeeProxy.increaseMaxMember(3, 2);

    ////////////////////////////////////////////////////////////////////////
    // test setting
    await committeeProxy.setActivityRewardPerSecond(toBN("1"));
    await agendaManager.setMinimumNoticePeriodSeconds(toBN("10000"));
    await agendaManager.setMinimumVotingPeriodSeconds(toBN("10000"));

    //await ton.mint(daoVault.address, TON_VAULT_AMOUNT.div(WTON_TON_RATIO).toFixed(TON_UNIT));
    //await wton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));

    ////////////////////////////////////////////////////////////////////////

    await registry.transferOwnership(committeeProxy.address);
    //await daoVault.transferOwnership(committeeProxy.address);
    await agendaManager.setCommittee(committeeProxy.address);
    await agendaManager.transferOwnership(committeeProxy.address);
    //await committee.transferOwnership(committeeProxy.address);
  } 

  async function totalBalanceOfCandidate(candidate) {
    const candidateContractAddress = await committeeProxy.candidateContract(candidate);
    const coinageAddress = await seigManager.coinages(candidateContractAddress);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    return await coinage.totalSupply();
  }

  describe('approve', function () {
    beforeEach(async function () {
      this.timeout(1000000);

      await ton.mint(daoVault.address, TON_VAULT_AMOUNT.div(WTON_TON_RATIO).toFixed(TON_UNIT));
      await wton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));
    });

    it('approveTON', async function () {
      this.timeout(1000000);
      const balanceBefore = await ton.balanceOf(user1);

      const amount = _TON("10").toFixed(TON_UNIT);
      await daoVault.approveTON(user1, amount);
      await ton.transferFrom(daoVault.address, user1, amount, {from: user1});

      const balanceAfter = await ton.balanceOf(user1);
      balanceAfter.sub(balanceBefore).should.be.bignumber.equal(amount);
    });

    it('approveWTON', async function () {
      this.timeout(1000000);
      const balanceBefore = await wton.balanceOf(user1);

      const amount = _WTON("10").toFixed(WTON_UNIT);
      await daoVault.approveWTON(user1, amount);
      await wton.transferFrom(daoVault.address, user1, amount, {from: user1});

      const balanceAfter = await wton.balanceOf(user1);
      balanceAfter.sub(balanceBefore).should.be.bignumber.equal(amount);
    });

    it('approveERC20', async function () {
      this.timeout(1000000);
      const token = ton;
      const balanceBefore = await token.balanceOf(user1);

      const amount = _TON("10").toFixed(TON_UNIT);
      await daoVault.approveERC20(token.address, user1, amount);
      await token.transferFrom(daoVault.address, user1, amount, {from: user1});

      const balanceAfter = await token.balanceOf(user1);
      balanceAfter.sub(balanceBefore).should.be.bignumber.equal(amount);
    });

    it('can not approveTON from others', async function () {
      await expectRevert(
        daoVault.approveTON(user1, toBN("1"), {from: user1}),
        "Ownable: caller is not the owner"
      );
    });

    it('can not approveWTON from others', async function () {
      await expectRevert(
        daoVault.approveWTON(user1, toBN("1"), {from: user1}),
        "Ownable: caller is not the owner"
      );
    });

    it('can not approveERC20 from others', async function () {
      await expectRevert(
        daoVault.approveERC20(ton.address, user1, toBN("1"), {from: user1}),
        "Ownable: caller is not the owner"
      );
    });
  });

  async function testClaimTon(tonAmount, expectedTonAmount, expectedWtonAmount) {
    const balanceBefore = await ton.balanceOf(user1);
    const balanceVaultTonBefore = await ton.balanceOf(daoVault.address);
    const balanceVaultWtonBefore = await wton.balanceOf(daoVault.address);

    await daoVault.claimTON(user1, tonAmount);

    const balanceAfter = await ton.balanceOf(user1);
    const balanceVaultTonAfter = await ton.balanceOf(daoVault.address);
    const balanceVaultWtonAfter = await wton.balanceOf(daoVault.address);

    balanceAfter.sub(balanceBefore).should.be.bignumber.equal(tonAmount);
    balanceVaultTonBefore.sub(balanceVaultTonAfter).should.be.bignumber.equal(expectedTonAmount);
    balanceVaultWtonBefore.sub(balanceVaultWtonAfter).should.be.bignumber.equal(expectedWtonAmount);
  }

  async function testClaimWton(wtonAmount, expectedTonAmount, expectedWtonAmount) {
    const balanceBefore = await wton.balanceOf(user1);
    const balanceVaultTonBefore = await ton.balanceOf(daoVault.address);
    const balanceVaultWtonBefore = await wton.balanceOf(daoVault.address);

    await daoVault.claimWTON(user1, wtonAmount);

    const balanceAfter = await wton.balanceOf(user1);
    const balanceVaultTonAfter = await ton.balanceOf(daoVault.address);
    const balanceVaultWtonAfter = await wton.balanceOf(daoVault.address);

    balanceAfter.sub(balanceBefore).should.be.bignumber.equal(wtonAmount);
    balanceVaultTonBefore.sub(balanceVaultTonAfter).should.be.bignumber.equal(expectedTonAmount);
    balanceVaultWtonBefore.sub(balanceVaultWtonAfter).should.be.bignumber.equal(expectedWtonAmount);
  }

  describe('claim', async function () {
    const testAmountInTon = _TON("100").toFixed(TON_UNIT);
    const testAmountInWton = _WTON("100").toFixed(WTON_UNIT);
    describe('zero TON in vault', function () {
      beforeEach(async function () {
        this.timeout(1000000);

        await wton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));
      });

      it('claimTON', async function () {
        this.timeout(1000000);
        await testClaimTon(testAmountInTon, toBN("0"), testAmountInWton);
      });

      it('claimWTON', async function () {
        this.timeout(1000000);
        await testClaimWton(testAmountInWton, toBN("0"), testAmountInWton);
      });
    });

    describe('zero WTON in vault', function () {
      beforeEach(async function () {
        this.timeout(1000000);

        await ton.mint(daoVault.address, TON_VAULT_AMOUNT.div(WTON_TON_RATIO).toFixed(TON_UNIT));
      });

      it('claimTON', async function () {
        this.timeout(1000000);
        await testClaimTon(testAmountInTon, testAmountInTon, toBN("0"));
      });

      it('claimWTON', async function () {
        this.timeout(1000000);
        await testClaimWton(testAmountInWton, testAmountInTon, toBN("0"));
      });
    });

    describe('not enough TON in vault', function () {
      const tonInVault = _TON("10").toFixed(TON_UNIT);
      beforeEach(async function () {
        this.timeout(1000000);

        await ton.mint(daoVault.address, tonInVault);
        await wton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));
      });

      it('claimTON', async function () {
        this.timeout(1000000);
        await testClaimTon(testAmountInTon, tonInVault, _WTON("90").toFixed(WTON_UNIT));
      });

      it('claimWTON', async function () {
        this.timeout(1000000);
        await testClaimWton(testAmountInWton, toBN("0"), testAmountInWton);
      });
    });

    describe('not enough WTON in vault', function () {
      const wtonInVault = _WTON("10").toFixed(WTON_UNIT);
      beforeEach(async function () {
        this.timeout(1000000);

        await ton.mint(daoVault.address, TON_VAULT_AMOUNT.div(WTON_TON_RATIO).toFixed(TON_UNIT));
        await wton.mint(daoVault.address, wtonInVault);
      });

      it('claimTON', async function () {
        this.timeout(1000000);
        await testClaimTon(testAmountInTon, testAmountInTon, toBN("0"));
      });

      it('claimWTON', async function () {
        this.timeout(1000000);
        await testClaimWton(testAmountInWton, _TON("90").toFixed(TON_UNIT), wtonInVault);
      });
    });

    describe('enough TON/WTON in vault', function () {
      beforeEach(async function () {
        this.timeout(1000000);

        await ton.mint(daoVault.address, TON_VAULT_AMOUNT.div(WTON_TON_RATIO).toFixed(TON_UNIT));
        await wton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));
      });

      it('claimTON', async function () {
        this.timeout(1000000);
        await testClaimTon(testAmountInTon, testAmountInTon, toBN("0"));
      });

      it('claimWTON', async function () {
        this.timeout(1000000);
        await testClaimWton(testAmountInWton, toBN("0"), testAmountInWton);
      });
    });

    describe('claim ERC20', function () {
      beforeEach(async function () {
        this.timeout(1000000);

        await ton.mint(daoVault.address, TON_VAULT_AMOUNT.div(WTON_TON_RATIO).toFixed(TON_UNIT));
      });

      it('claimERC20', async function () {
        const token = ton;
        const balanceBefore = await token.balanceOf(user1);

        const amount = _TON("10").toFixed(TON_UNIT);
        await daoVault.claimERC20(token.address, user1, amount);

        const balanceAfter = await token.balanceOf(user1);
        balanceAfter.sub(balanceBefore).should.be.bignumber.equal(amount);
      });
    });

    describe('Authority', function () {
      it('can not claimTON from others', async function () {
        await expectRevert(
          daoVault.claimTON(user1, toBN("1"), {from: user1}),
          "Ownable: caller is not the owner"
        );
      });

      it('can not claimWTON from others', async function () {
        await expectRevert(
          daoVault.claimWTON(user1, toBN("1"), {from: user1}),
          "Ownable: caller is not the owner"
        );
      });

      it('can not claimERC20 from others', async function () {
        await expectRevert(
          daoVault.claimERC20(ton.address, user1, toBN("1"), {from: user1}),
          "Ownable: caller is not the owner"
        );
      });
    });
  });
});
