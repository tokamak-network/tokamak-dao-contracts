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
const TON_INITIAL_HOLDERS = _TON('10000');
const TON_VAULT_AMOUNT = _TON('10000000');

const WITHDRAWAL_DELAY = 10;
const SEIG_PER_BLOCK = _WTON('3.92');
const ROUND_DURATION = time.duration.minutes(5);

const POWERTON_SEIG_RATE = _WTON('0.1');
const DAO_SEIG_RATE = _WTON('0.5');
const PSEIG_RATE = _WTON('0.4');
////////////////////////////////////////////////////////////////////////////////

const owner= defaultSender;
let daoVault2,committee, election, electionProxy, committeeStore, activityFeeManager , agendaManager, committeeL2Factory;
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
    daoVault = await DAOVault.new(ton.address, 0);
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
    await ton.transfer(daoVault.address, TON_VAULT_AMOUNT.toFixed(TON_UNIT));
    
  }

  async function initializeDaoContracts( ) {
    debugLog =true;
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
    this.dAOElectionStore = await DAOElectionStore.new(this.ton.address);
    election = this.dAOElectionStore ; 
    if(debugLog)  console.log('election :', election.address) ;
    //=================
    this.dAOCommitteeStore = await DAOCommitteeStore.new(this.ton.address);
    if(debugLog)  console.log('dAOCommitteeStore :', this.dAOCommitteeStore.address) ;

    committeeStore = this.dAOCommitteeStore;
    if(debugLog)  console.log('committeeStore :', committeeStore.address) ;

    this.dAOCommittee = await DAOCommittee.new();
    if(debugLog)  console.log('dAOCommittee :', dAOCommittee.address) ;

    this.dAOCommitteeProxy = await DAOCommitteeProxy.new(committeeStore.address);
    if(debugLog)  console.log('dAOCommitteeProxy :', dAOCommitteeProxy.address) ;
    
    await this.dAOCommitteeStore.transferOwnership(this.dAOCommitteeProxy.address);
    await election.transferOwnership(this.dAOCommitteeProxy.address);
    electionProxy = this.dAOCommitteeProxy;

    /*
    await this.dAOCommitteeProxy.setProxyDaoCommittee(committee.address);
    await this.dAOCommitteeProxy.setProxyCommitteeL2Factory(committeeL2Factory.address);
    await this.dAOCommitteeProxy.setProxyLayer2Registry(addrs.Layer2Registry);
    await this.dAOCommitteeProxy.setProxySeigManager(addrs.SeigManager);
    */
    await this.dAOCommitteeProxy.upgradeTo(this.dAOCommittee.address);
    await this.dAOCommitteeProxy.setProxyPause(false);
    await this.dAOCommitteeProxy.setProxyAgendaManager(this.dAOCommittee.address);
    await this.dAOCommitteeProxy.setProxyAactivityfeeManager(this.dAOCommittee.address);
    if(debugLog)  console.log('dAOCommitteeProxy  set end :' ) ;

    let impl = await this.dAOCommitteeProxy.implementation() ;

    committee = await DAOCommittee.at(this.dAOCommitteeProxy.address);
    if(debugLog)  console.log('committee :', committee.address ) ;
     
    // later ..
    //await committee.setDaoElection(this.dAOCommittee.address);
    await committee.setDaoVault(daoVault2.address);
    if(debugLog)  console.log('committee.setDaoVault end :') ;

    //
    await daoVault2.setDaoCommittee(this.dAOCommitteeProxy.address);

    if(debugLog){
      console.log('dAOCommitteeStore :', this.dAOCommitteeStore.address) ;
      console.log('dAOCommittee :', this.dAOCommittee.address) ;
      console.log('dAOCommitteeProxy :', this.dAOCommitteeProxy.address) ;
      console.log('dAOCommitteeProxy implementation :', impl) ;
    }

    //=================================================== 
    await committeeL2Factory.transferOwnership(committee.address); 

    //=================================================== 

    await registry.transferOwnership(committee.address);

    console.log('\n\n');
 
  } 

  describe('Test 1-1', function () {
    
    before(async function () { 
      
    });
    
    it('subtest 1 : Election 주소 설정은 오너만 할 수 있다. ', async function () {
      this.timeout(1000000);
      console.log('election.address',election.address);

      await expectRevert.unspecified(electionProxy.setProxyElection(election.address, {from : user6}));
      tx = await electionProxy.setProxyElection(election.address, {from : owner});
      recordGasUsed(tx, 'CommitteeProxy.setProxyElection');

      let res = await electionProxy.getProxyElection(); 
      expect(res).to.equal(election.address);
    });

    it('subtest 2 : CommitteeLayer2 Factory 주소 설정은 오너만 할 수 있다.  ', async  function () {
      await expectRevert.unspecified(electionProxy.setProxyCommitteeL2Factory(committeeL2Factory.address, {from : user6}));
      tx = await electionProxy.setProxyCommitteeL2Factory(committeeL2Factory.address, {from : owner});
      recordGasUsed(tx, 'CommitteeProxy.setProxyCommitteeL2Factory');

      let res = await election.getCommitteeL2Factory(); 
      expect(res).to.equal(committeeL2Factory.address);
    });

    it('subtest 3 : Layer2 Registry 설정은 오너만 할 수 있다.  ', async  function () {
      await expectRevert.unspecified(electionProxy.setProxyLayer2Registry(registry.address, {from : user6}));
      tx = await electionProxy.setProxyLayer2Registry(registry.address, {from : owner});
      recordGasUsed(tx, 'CommitteeProxy.setProxyLayer2Registry');

      let res = await election.getLayer2Registry(); 
      expect(res).to.equal(registry.address);
    });

    it('subtest 4 : SeigManager 설정은 오너만 할 수 있다. ',  async function () {
      await expectRevert.unspecified(electionProxy.setProxySeigManager(seigManager.address, {from : user6}));
      tx = await electionProxy.setProxySeigManager(seigManager.address, {from : owner});
      recordGasUsed(tx, 'CommitteeProxy.setProxySeigManager');

      let res = await election.getSeigManager(); 
      expect(res).to.equal(seigManager.address);
    });
    /* 
    it('subtest 5 : DepositManager 설정은 오너만 할 수 있다.',  async function () {
      await expectRevert.unspecified(election.setDepositManager(depositManager.address, {from : user6}));
      tx = await election.setDepositManager(depositManager.address, {from : owner});
      recordGasUsed(tx, 'Election.setDepositManager');

      let res = await election.getDepositManager(); 
      expect(res).to.equal(depositManager.address);
    }); 
    */ 
     
    it('subtest 5 : 누구나 CommitteeLayer2를 생성할 수 있다. ',  async function () {
      tx = await committee.createCommitteeLayer2('i am user6', {from : user6});
      let args = verifyTransaction(tx, user6);
      //console.log('CommitteeLayer2Created :  ',args );
      recordGasUsed(tx, 'Election.createLayer2');
      expect(verifyEvent(tx, 'CommitteeLayer2Created')).to.be.true; 
    });
     
  });
});
