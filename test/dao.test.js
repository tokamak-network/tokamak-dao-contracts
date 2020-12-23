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

// dao-contracts
const DAOVault2 = contract.fromArtifact('DAOVault2');
const DAOCommittee = contract.fromArtifact('DAOCommittee');
const DAOActivityFeeManager = contract.fromArtifact('DAOActivityFeeManager');
const DAOAgendaManager = contract.fromArtifact('DAOAgendaManager');
const CommitteeL2Factory = contract.fromArtifact('CommitteeL2Factory');
const DAOCommitteeStore = contract.fromArtifact('DAOCommitteeStore');
const DAOCommitteeProxy = contract.fromArtifact('DAOCommitteeProxy');
const DAOElectionStore = contract.fromArtifact('DAOElectionStore');
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
const DAOVault = contract.fromArtifact('DAOVault');

let o;
process.on('exit', function () {
  console.log(o);
});

const [ committee1, committee2, committee3, user1, user2, user3, user4,user5,user6] = accounts;
const committees = [committee1, committee2, committee3];
const users = [user1, user2, user3];
const deployer = defaultSender;


const _TON = createCurrency('TON');
const _WTON = createCurrency('WTON');
const _WTON_TON = createCurrencyRatio(_WTON, _TON);

const TON_UNIT = 'wei';
const WTON_UNIT = 'ray';
const WTON_TON_RATIO = _WTON_TON('1');

////////////////////////////////////////////////////////////////////////////////
// test settings
const TON_INITIAL_SUPPLY = _TON('50000000');
const TON_INITIAL_HOLDERS = _TON('1000000');
const TON_VAULT_AMOUNT = _WTON('10000000');

const WITHDRAWAL_DELAY = 10;
const SEIG_PER_BLOCK = _WTON('3.92');
const ROUND_DURATION = time.duration.minutes(5);

const POWERTON_SEIG_RATE = _WTON('0.1');
const DAO_SEIG_RATE = _WTON('0.5');
const PSEIG_RATE = _WTON('0.4');

const TON_MINIMUM_STAKE_AMOUNT = _TON('1000');
////////////////////////////////////////////////////////////////////////////////

const owner= defaultSender;
let daoVault2, committeeProxy, committee, committeeStore, activityFeeManager , agendaManager, committeeL2Factory;
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

describe('Test 1', function () {
  before(async function () {
    this.timeout(1000000);

    //this.enableTimeouts(false);
    //this.timeout(10000000);
    console.log('initializePlasmaEvmContracts ... ') ;
    await initializePlasmaEvmContracts(); 
    console.log('initializeDaoContracts ... ') ;
    await initializeDaoContracts();
     
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
    console.log(`currentTime1: ${currentTime}`);
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
    await committees.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)));
    await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)));  
    await wton.mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));

    await seigManager.setMinimumAmount(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT))
  }

  async function initializeDaoContracts() {
    debugLog =false;
    this.ton = ton;
    if(debugLog) console.log('ton :', this.ton.address) ;

    //===================================================
    this.dAOVault = await DAOVault2.new(this.ton.address);
    //await this.ton.mint(this.dAOVault.address, initialSupplyDAOVault);
    daoVault2 = this.dAOVault ;
    if(debugLog)  console.log('daoVault2 :', daoVault2.address) ;

    let totalTon = await this.ton.totalSupply();
    if(debugLog) console.log('totalTon :', _TON(totalTon).toNumber() ) ;

    //===================================================
    activityFeeManager = await DAOActivityFeeManager.new(this.ton.address);
    if(debugLog)  console.log('activityFeeManager :', activityFeeManager.address) ;

    await activityFeeManager.setDaoVault(daoVault2.address);
    if(debugLog)  console.log('activityFeeManager setDaoVault end' ) ;
    
    //===================================================
    agendaManager = await DAOAgendaManager.new(this.ton.address);
    await agendaManager.setActivityFeeManager(activityFeeManager.address);
    if(debugLog)  console.log('agendaManager :', agendaManager.address) ;
    //===================================================
    committeeL2Factory = await CommitteeL2Factory.new();
    if(debugLog)  console.log('committeeL2Factory :', committeeL2Factory.address) ;
    //===================================================
    this.dAOCommitteeStore = await DAOCommitteeStore.new(this.ton.address);
    if(debugLog)  console.log('dAOCommitteeStore :', this.dAOCommitteeStore.address) ;

    committeeStore = this.dAOCommitteeStore;
    if(debugLog)  console.log('committeeStore :', committeeStore.address) ;

    this.dAOCommittee = await DAOCommittee.new();
    if(debugLog)  console.log('dAOCommittee :', dAOCommittee.address) ;
    committee = this.dAOCommittee;

    this.dAOCommitteeProxy = await DAOCommitteeProxy.new(committeeStore.address);
    if(debugLog)  console.log('dAOCommitteeProxy :', dAOCommitteeProxy.address) ;
   
    await this.dAOCommitteeProxy.upgradeTo(this.dAOCommittee.address);
    await this.dAOCommitteeStore.transferOwnership(this.dAOCommitteeProxy.address);
    //await this.dAOCommitteeProxy.setProxyPause(false);
    await this.dAOCommitteeProxy.setProxyAgendaManager(this.dAOCommittee.address);
    await this.dAOCommitteeProxy.setProxyAactivityfeeManager(this.dAOCommittee.address);
    if(debugLog)  console.log('dAOCommitteeProxy  set end :' ) ;

    let impl = await this.dAOCommitteeProxy.implementation() ;

    committeeProxy = await DAOCommittee.at(this.dAOCommitteeProxy.address);
    if(debugLog)  console.log('committeeProxy :', committeeProxy.address ) ;
     
    // later ..
    //await committeeProxy.setDaoElection(this.dAOCommittee.address);
    await committeeProxy.setDaoVault(daoVault2.address);
    if(debugLog)  console.log('committeeProxy.setDaoVault end :') ;

    //
    await daoVault2.setDaoCommittee(this.dAOCommitteeProxy.address);

    if(debugLog){
      console.log('dAOCommitteeStore :', this.dAOCommitteeStore.address) ;
      console.log('dAOCommittee :', this.dAOCommittee.address) ;
      console.log('dAOCommitteeProxy :', this.dAOCommitteeProxy.address) ;
      console.log('dAOCommitteeProxy implementation :', impl) ;
    }

    //===================================================
    this.dAOElectionStore = await DAOElectionStore.new(this.ton.address);
    //this.dAOElection = await DAOElection.new();
    //this.dAOElectionProxy = await DAOElectionProxy.new(this.dAOElectionStore.address);
    //await this.dAOElectionStore.transferOwnership(committeeProxy.address);
    //await this.dAOElectionProxy.upgradeTo(this.dAOElection.address);
    //await this.dAOElectionProxy.setProxyPause(false);
    //electionProxy = this.dAOElectionProxy;

    /*
    await this.dAOElectionProxy.setProxyDaoCommittee(committeeProxy.address);
    await this.dAOElectionProxy.setProxyCommitteeL2Factory(committeeL2Factory.address);
    await this.dAOElectionProxy.setProxyLayer2Registry(addrs.Layer2Registry);
    await this.dAOElectionProxy.setProxySeigManager(addrs.SeigManager);
    */
    //let implelection = await this.dAOElectionProxy.implementation() ;
    //election = await DAOElection.at(this.dAOElectionProxy.address);
    election = this.dAOElectionStore;

    //committeeL2Factory.transferOwnership(election.address);
    //=================================================== 

    await committeeProxy.setElection(election.address);
    await election.setSeigManager(seigManager.address);
    await committeeProxy.setSeigManager();
    await election.setLayer2Registry(registry.address);
    await committeeProxy.setLayer2Registry();
    await election.setCommitteeL2Factory(committeeL2Factory.address);
    await committeeProxy.setCommitteeL2Factory();

    await registry.transferOwnership(committeeProxy.address);
    await daoVault2.setDaoCommittee(committeeProxy.address);
    await daoVault2.setDAOActivityFeeManager(activityFeeManager.address);
    await daoVault2.transferOwnership(committeeProxy.address);
    await activityFeeManager.transferOwnership(committeeProxy.address);
    await agendaManager.transferOwnership(committeeProxy.address);
    await committeeL2Factory.transferOwnership(committeeProxy.address);
    await election.transferOwnership(committeeProxy.address);
    await this.dAOCommittee.transferOwnership(committeeProxy.address);
    //await this.dAOCommitteeStore.transferOwnership(this.dAOCommitteeProxy.address);

    console.log('\n\n');
  } 

  async function deposit(committeeContractAddress, account, tonAmount) {
    const data = marshalString(
      [depositManager.address, committeeContractAddress]
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
  }

  async function addCommitteeCandidate(candidate) {
    const beforeTonBalance = await ton.balanceOf(candidate);

    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    await ton.approve(committeeProxy.address, stakeAmountTON, {from: candidate});
    tmp = await ton.allowance(candidate, committeeProxy.address);
    tmp.should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT));
    await committeeProxy.createCommitteeCandidate(candidate, {from: candidate});

    // stake
    const res = await election.detailedCommitteeInfoByCandidate(candidate);
    /*const data = marshalString(
      [depositManager.address, res[0]]
        .map(unmarshalString)
        .map(str => padLeft(str, 64))
        .join(''),
    );
    await ton.approveAndCall(
      wton.address,
      stakeAmountTON,
      data,
      {from: candidate}
    );*/
    await deposit(res[0], candidate, stakeAmountTON);

    const afterTonBalance = await ton.balanceOf(candidate);
    beforeTonBalance.sub(afterTonBalance).should.be.bignumber.equal(stakeAmountTON);

    const coinageAddress = await seigManager.coinages(res[0]);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmount = await coinage.balanceOf(candidate);
    stakedAmount.should.be.bignumber.gt(toBN('0'));
    stakedAmount.should.be.bignumber.equal(stakeAmountWTON);
  }

  describe('Committee candidate', function () {
    it('add new candidate', async function () {
      await addCommitteeCandidate(user1);
    });

  });

  describe('Test 1-1', function () {
    
    before(async function () { 
    });

    describe('contracts ownership', function () {
      it('check ownership', async function () {
      });

      it('check ownership functions', async function () {
      });
    });

    describe('DaoVault', function () {
      it('claim', async function () {
        let amount = await wton.balanceOf(daoVault.address);
        console.log(`vault amount: ${amount}`);
        amount.should.be.bignumber.gt(toBN('0'));
        beforeBalance = await wton.balanceOf(daoVault2.address);
        const owner = await daoVault.owner();
        console.log(`owner: ${owner}`);
        console.log(`deployer: ${deployer}`);
        currentTime = await time.latest();
        console.log(`currentTime2: ${currentTime}`);
        await daoVault.claim(daoVault2.address);
        //await daoVault.claim(deployer, {from: owner});
        afterBalance = await ton.balanceOf(daoVault2.address);

        afterBalance.sub(beforeBalance).should.be.bignumber.equal(TON_VAULT_AMOUNT.div(WTON_TON_RATIO).toFixed(TON_UNIT));
        amount = await wton.balanceOf(daoVault.address);
        amount.should.be.bignumber.equal(toBN('0'));
      });
    });

    /*describe('DaoVault2', function () {
      beforeEach(async function () { 
        await daoVault2.approveTonDao(0);
      });

      it('approveTonDao', async function () {
        const testAmount = 10000;
        await daoVault2.approveTonDao(testAmount);
        expect(await ton.allowance(daoVault2.address, committeeProxy.address)).to.bignumber.equal(toBN(testAmount));
        expect(await ton.allowance(daoVault2.address, activityFeeManager.address)).to.bignumber.equal(toBN(testAmount));
      });

      it('approveTonDaoCommittee', async function () {
        const testAmount = 10000;

        expect(await ton.allowance(daoVault2.address, committeeProxy.address)).to.bignumber.equal(toBN('0'));
        expect(await ton.allowance(daoVault2.address, activityFeeManager.address)).to.bignumber.equal(toBN('0'));

        await daoVault2.approveTonDaoCommittee(testAmount);
        expect(await ton.allowance(daoVault2.address, committeeProxy.address)).to.bignumber.equal(toBN(testAmount));
        expect(await ton.allowance(daoVault2.address, activityFeeManager.address)).to.bignumber.equal(toBN('0'));
      });

      it('approveTonDAOActivityFeeManager', async function () {
        const testAmount = 10000;

        expect(await ton.allowance(daoVault2.address, committeeProxy.address)).to.bignumber.equal(toBN('0'));
        expect(await ton.allowance(daoVault2.address, activityFeeManager.address)).to.bignumber.equal(toBN('0'));

        await daoVault2.approveTonDAOActivityFeeManager(testAmount);
        expect(await ton.allowance(daoVault2.address, committeeProxy.address)).to.bignumber.equal(toBN('0'));
        expect(await ton.allowance(daoVault2.address, activityFeeManager.address)).to.bignumber.equal(toBN(testAmount));
      });

      it('approveTon', async function () {
        const testAmount = 10000;

        expect(await ton.allowance(daoVault2.address, user1)).to.bignumber.equal(toBN('0'));

        await daoVault2.approveTon(user1, testAmount);
        expect(await ton.allowance(daoVault2.address, user1)).to.bignumber.equal(toBN(testAmount));
      });

      it('claimCommittee', async function () {
        //const testAmount = 10000;

        //await daoVault2.claimCommittee(user1, testAmount);
      });

      it('claimActivityFeeManager', async function () {
      });

      it('transfer', async function () {
      });

    });*/

    /*describe('DAOElection', function () {
      it('applyCommitteeByOperator', async function () {
      });

      it('applyCommittee', async function () {
      });

      it('createCommitteeLayer2', async function () {
      });

      it('numLayer2s', async function () {
      });

      it('totalSupplyLayer2s', async function () {
      });

      it('balanceOfLayer2s', async function () {
      });

    });*/

    /*describe('DAOCommittee', function () {
      it('setDaoElection', async function () {
      });

      it('setDaoVault', async function () {
      });

      it('setAgendamanager', async function () {
      });

      it('setActivityfeemanager', async function () {
      });

      it('setMaxCommittees', async function () {
      });

      it('popCommitteeSlot', async function () {
      });

      it('applyCommittee', async function () {
      });

      it('retireCommittee', async function () {
      });

      it('setMinimunNoticePeriodMin', async function () {
      });

      it('setMinimunVotingPeriodMin', async function () {
      });

      it('setQuorum', async function () {
      });

      it('setCreateAgendaFees', async function () {
      });

      it('createAgenda', async function () {
      });

      it('electCommiitteeForAgenda', async function () {
      });

      it('checkRisk', async function () {
      });

      it('castVote', async function () {
      });

      it('executeAgenda', async function () {
      });

      it('detailedAgenda', async function () {
      });

      it('detailedAgendaVoteInfo', async function () {
      });

      it('totalAgendas', async function () {
      });

      it('getMajority', async function () {
      });

      it('getMajority', async function () {
      });

    });*/
  });
});
