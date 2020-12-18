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


// dao-contracts
const DAOVault2 = contract.fromArtifact('DAOVault2');
const DAOCommittee = contract.fromArtifact('DAOCommittee');
const DAOActivityFeeManager = contract.fromArtifact('DAOActivityFeeManager');
const DAOAgendaManager = contract.fromArtifact('DAOAgendaManager');
const CommitteeL2Factory = contract.fromArtifact('CommitteeL2Factory');
const DAOCommitteeStore = contract.fromArtifact('DAOCommitteeStore');
const DAOCommitteeProxy = contract.fromArtifact('DAOCommitteeProxy');
const DAOElectionStore = contract.fromArtifact('DAOElectionStore');
const DAOElection = contract.fromArtifact('DAOElection');
const DAOElectionProxy = contract.fromArtifact('DAOElectionProxy');

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
let daoVault2,committee, election, electionProxy, committeeStore ;
let agendaManager, activityFeeManager, committeeL2Factory;
let gasUsedRecords = [];
let gasUsedTotal = 0; 
let debugLog=true;
let tx  ;  
let DEF_CreateAgendaFees = '1000000000000000000';
let method = {
  name: 'claimCommittee',
  type: 'function',
  inputs: [{
      type: 'address',
      name: 'committee'
  },
  {
      type: 'uint256',
      name: 'amount'
  }]
};
let amountTransfer = 1000000000000000000;  
const initialSupplyDAOVault = _TON('1000000').toFixed(TON_UNIT);
//------------------

let ton;
let wton;
let registry;
let depositManager;
let factory;
let daoVault;
let seigManager;
let powerton;

describe('DAOCommittee Test', function () {
  before(async function () {
    this.timeout(1000000);

    //this.enableTimeouts(false);
    //this.timeout(10000000); 
    await initializePlasmaEvmContracts();  
    await initializeDaoContracts(); 
  });

  after(async() => {
    printGasUsed()
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
    debugLog =false;
    this.ton = ton;
    if(debugLog) console.log('ton :', this.ton.address) ;
   
    //===================================================
    this.dAOVault = await DAOVault2.new(this.ton.address);
    await this.ton.mint(this.dAOVault.address, initialSupplyDAOVault);
    
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

    this.dAOCommitteeProxy = await DAOCommitteeProxy.new(committeeStore.address);
    if(debugLog)  console.log('dAOCommitteeProxy :', dAOCommitteeProxy.address) ;
   
   
    await this.dAOCommitteeStore.transferOwnership(this.dAOCommitteeProxy.address);
    await this.dAOCommitteeProxy.upgradeTo(this.dAOCommittee.address);
    await this.dAOCommitteeProxy.setProxyPause(false);

    await this.dAOCommitteeProxy.setProxyAgendaManager(agendaManager.address);
    await this.dAOCommitteeProxy.setProxyAactivityfeeManager(activityFeeManager.address);
    agendaManager.transferOwnership(this.dAOCommitteeProxy.address, {from : owner}) ;
    activityFeeManager.transferOwnership(this.dAOCommitteeProxy.address, {from : owner}) ;

    if(debugLog)  console.log('dAOCommitteeProxy  set end :' ) ;

    let impl = await this.dAOCommitteeProxy.implementation() ;

    committee = await DAOCommittee.at(this.dAOCommitteeProxy.address);
    if(debugLog)  console.log('committee :', committee.address ) ;
     
    // later ..
    //await committee.setDaoElection(this.dAOCommittee.address);
    //await committee.setDaoVault(daoVault2.address);
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
    this.dAOElectionStore = await DAOElectionStore.new(this.ton.address);
    this.dAOElection = await DAOElection.new();
    this.dAOElectionProxy = await DAOElectionProxy.new(this.dAOElectionStore.address);
    await this.dAOElectionStore.transferOwnership(this.dAOElectionProxy.address);
    await this.dAOElectionProxy.upgradeTo(this.dAOElection.address);
    await this.dAOElectionProxy.setProxyPause(false);
    electionProxy = this.dAOElectionProxy;

    /*
    await this.dAOElectionProxy.setProxyDaoCommittee(committee.address);
    await this.dAOElectionProxy.setProxyCommitteeL2Factory(committeeL2Factory.address);
    await this.dAOElectionProxy.setProxyLayer2Registry(addrs.Layer2Registry);
    await this.dAOElectionProxy.setProxySeigManager(addrs.SeigManager);
    */
    let implelection = await this.dAOElectionProxy.implementation() ;
    election = await DAOElection.at(this.dAOElectionProxy.address);

    committeeL2Factory.transferOwnership(election.address);

    if(debugLog){
      console.log('dAOElectionStore :', this.dAOElectionStore.address) ;
      console.log('dAOElection :', this.dAOElection.address) ;
      console.log('dAOElectionProxy :', this.dAOElectionProxy.address) ;
      console.log('dAOElectionProxy implementation :', implelection) ;
    }

    //===================================================  
    //await committee.setDaoElection(election.address);
    
    console.log('\n\n');
 
  } 

  describe('onlyOwner Functions Test 1.', function () {
    
    before(async function () { 
       
    });
    
    it('subtest 1 : DaoElection 주소 설정은 오너만 할 수 있다. ', async function () {
      this.timeout(1000000);
      await expectRevert.unspecified(committee.setDaoElection(election.address, {from : user6}));
      tx = await committee.setDaoElection(election.address, {from : owner});
      recordGasUsed(tx, 'setDaoElection');

      let res = await committeeStore.getDaoElection(); 
      expect(res).to.equal(election.address);
    });

    it('subtest 2 : DaoVault 주소 설정은 오너만 할 수 있다.  ', async  function () {
      await expectRevert.unspecified(committee.setDaoVault(daoVault2.address, {from : user6}));
      tx = await committee.setDaoVault(daoVault2.address, {from : owner});
      recordGasUsed(tx, 'setDaoVault');

      let res = await committeeStore.getDaoVault(); 
      expect(res).to.equal(daoVault2.address);
    });

    it('subtest 3 : committee 최대수 설정은 오너만 할 수 있다.  ', async  function () {
      let maxNum = 5;
      let maxNumBN = toBN(5);
      await expectRevert.unspecified(committee.setMaxCommittees(maxNumBN, {from : user6}));
      tx = await committee.setMaxCommittees(maxNumBN, {from : owner});
      recordGasUsed(tx, 'setMaxCommittees');

      let res = await committeeStore.maxCommittees(); 
      expect(toBN(res)).to.be.bignumber.equal(maxNumBN);
     
      let res1 = await committeeStore.totalCommittees(); 
      expect(toBN(res1)).to.be.bignumber.equal(maxNumBN);
      
      tx = await committee.popCommitteeSlot({from : owner});
      recordGasUsed(tx, 'popCommitteeSlot');
      tx = await committee.popCommitteeSlot({from : owner});
      
      maxNumBN = toBN(3); 
      res1 = await committeeStore.totalCommittees();  
      expect(toBN(res1)).to.be.bignumber.equal(maxNumBN);
       
      tx = await committee.setMaxCommittees(maxNumBN, {from : owner});
      recordGasUsed(tx, 'setMaxCommittees');
      res = await committeeStore.maxCommittees(); 
      expect(toBN(res)).to.be.bignumber.equal(maxNumBN);
    }); 
     
    it('subtest 4 : 최소 공시 기간 설정은 오너만 할 수 있다. ',  async function () {
      let _period = 1; // 2 min

      let minimunNoticePeriod = toBN(_period);
      await expectRevert.unspecified(committee.setMinimunNoticePeriodMin(minimunNoticePeriod, {from : user6}));
      tx = await committee.setMinimunNoticePeriodMin(minimunNoticePeriod, {from : owner});
      recordGasUsed(tx, 'setMinimunNoticePeriodMin');
      //let agenda_mnager = await election.agendaManager();  

      let res = await agendaManager.getMinimunNoticePeriodMin(); 
      expect(toBN(res)).to.be.bignumber.equal(minimunNoticePeriod);
    });
    
    it('subtest 5 : 최소 투표기간 설정은 오너만 할 수 있다.',  async function () {
      let _period = 2; // 2 min

      let minimunVotingPeriod = toBN(_period);
      await expectRevert.unspecified(committee.setMinimunVotingPeriodMin(minimunVotingPeriod, {from : user6}));
      tx = await committee.setMinimunVotingPeriodMin(minimunVotingPeriod, {from : owner});
      recordGasUsed(tx, 'setMinimunVotingPeriodMin');
      //let agenda_mnager = await election.agendaManager();  

      let res = await agendaManager.getMinimunVotingPeriodMin(); 
      expect(toBN(res)).to.be.bignumber.equal(minimunVotingPeriod);
    });
 
    it('subtest 6 : 투표집계 승인기준 설정 ',  async function () {
      let ratio = await agendaManager.getQuorumRatio(); 
      expect(ratio[0]).to.be.bignumber.equal(toBN(1));  
      expect(ratio[1]).to.be.bignumber.equal(toBN(2));  

      await expectRevert.unspecified(committee.setQuorum(2,3, {from : user6}));
      tx = await committee.setQuorum(2,3, {from : owner});
      recordGasUsed(tx, 'setQuorum');

      ratio =await agendaManager.getQuorumRatio(); 
      expect(ratio[0]).to.be.bignumber.equal(toBN(2));  
      expect(ratio[1]).to.be.bignumber.equal(toBN(3));  
      
      tx = await committee.setQuorum(1,2, {from : owner});
    });
 
    it("subtest 7 : 아젠다 생성비용 설정 ", async () => {
      await expectRevert.unspecified(committee.setCreateAgendaFees(toBN(DEF_CreateAgendaFees), {from : user6}));
      tx = await committee.setCreateAgendaFees(toBN(DEF_CreateAgendaFees), {from : owner});
      recordGasUsed(tx, 'setCreateAgendaFees');
      
      let createAgendaFees =await agendaManager.getCreateAgendaFees(); 
      expect(createAgendaFees).to.be.bignumber.equal(toBN(DEF_CreateAgendaFees));  
    }); 
 
  });


  describe('Anybody Transactions ', function () {
    
    before(async function () { 
       
    });
    
    it('subtest 1 : 커미티의 스테이킹 총량 갱신하기  ', async function () {
       
    });

    it('subtest 2 : 아젠다 생성하기 ', async function () { 
      let _group =1; 
      let _target = daoVault2.address;
      let _noticePeriodMin = 2; // 3min , current default 2  
      let _description = 'test by user6 ';  
      let params = [user6, amountTransfer];
      let functionBytecode = web3Helper.encodeMethod(method, params);

      //================================
      let totalAgendas= await agendaManager.totalAgendas();

      createAgendaFees = await agendaManager.getCreateAgendaFees();  

      let usertonbalance = await ton.balanceOf(user6) ;
      //console.log('usertonbalance 1',_TON(usertonbalance).toNumber(), _TON(createAgendaFees).toNumber() ) ;
      
      
      let ton_address = await committee.getTON();  
      //console.log('ton_address 1',ton_address ) ;
      
      if( usertonbalance < createAgendaFees ){
        await expectRevert(
          committee.createAgenda(_group,_target,_noticePeriodMin,functionBytecode,_description, {from : user6}),
          'not enough ton balance',
        ); 
      }

      if( createAgendaFees > 0 && usertonbalance < createAgendaFees){
        await ton.mint(user6, createAgendaFees);
      } 
      usertonbalance = await ton.balanceOf(user6) ;

      //console.log('usertonbalance 2 ',_TON(usertonbalance).toNumber(), _TON(createAgendaFees).toNumber() ) ;
       
      tx = await ton.approve(committee.address, createAgendaFees, {from:user6} );
      tx = await committee.createAgenda(_group,_target,_noticePeriodMin,functionBytecode,_description, {from : user6});
      recordGasUsed(tx, 'createAgenda'); 
      agendaID = verifyTransaction(tx, user6); 
  
      let totalAgendasnow = await agendaManager.totalAgendas();
      let addOne = totalAgendas.add(toBN(1)) ;
      expect(toBN(addOne).toNumber()).to.equal(toBN(totalAgendasnow).toNumber());

      totalAgendas = totalAgendasnow;    

    });
    /* 
    it('subtest 3 : 아젠다에 커미티 선출  ', async function () {
       
    });
    it('subtest 4 : 아젠다 실행   ', async function () {
       
    });
    */ 
  });
  /* 
  describe('Anybody View Functions ', function () {
    
    before(async function () { 
       
    });
    
    it('subtest 1 : 아젠다 상세 정보  ', async function () {
       
    });
    it('subtest 2 : 전체 아젠다 개수 확인  ', async function () {
       
    });
    it('subtest 3 : 아젠다 승인을 위한  최소 찬성 수  ', async function () {
       
    });
    it('subtest 4 : 아젠다 승인을 위한  최소 찬성 수    ', async function () {
       
    });

  });
  */

});
