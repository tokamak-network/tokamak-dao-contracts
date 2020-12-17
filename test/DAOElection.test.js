const { range, last, first } = require('lodash');

const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');
const web3Abi = require('web3-eth-abi');
const web3Helper = require('web3-abi-helper').Web3Helper;
const path = require('path');

//deployfile = path.join(__dirname, "../deployed.json")

const addrs = require('../deployed.json');
const l2 = require('../l2.json');

//const Web3 = require("web3");
/*
const {
  defaultSender, accounts, contract, web3,
} = require('@openzeppelin/test-environment');
 */

const {
  BN, constants, expectEvent, expectRevert, time, ether,
} = require('@openzeppelin/test-helpers');

const { padLeft, toBN } = require('web3-utils');

//const { marshalString, unmarshalString } = require('../helpers/marshal');

const chai = require('chai');
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require('constants');
chai
  .use(require('chai-bn')(BN))
  .should();
const { expect } = chai;

const LOGTX = process.env.LOGTX || false;
const VERBOSE = process.env.VERBOSE || false;

const development = true;

const _TON = createCurrency('TON'); 
const TON_WEI_UNIT = 'wei';
const TON_UNIT = 'ether';

//-- contracts --------------------------------------------------------
 
const TON = artifacts.require('TON');
const DAOVault = artifacts.require('DAOVault');

const DAOCommittee = artifacts.require('DAOCommittee');
const DAOCommitteeProxy = artifacts.require('DAOCommitteeProxy');
const DAOCommitteeStore = artifacts.require('DAOCommitteeStore');

const DAOElection = artifacts.require('DAOElection');
const DAOElectionProxy = artifacts.require('DAOElectionProxy');
const DAOElectionStore = artifacts.require('DAOElectionStore');

const CommitteeL2Factory = artifacts.require('CommitteeL2Factory'); 
const DAOActivityFeeManager = artifacts.require('DAOActivityFeeManager'); 
const DAOAgendaManager = artifacts.require('DAOAgendaManager'); 

const IDAOCommittee = artifacts.require('IDAOCommittee');  

 /*
const TON = contract.fromArtifact('TON');
const DAOVault = contract.fromArtifact('DAOVault');

const DAOCommittee = contract.fromArtifact('DAOCommittee');
const DAOCommitteeProxy = contract.fromArtifact('DAOCommitteeProxy');
const DAOCommitteeStore = contract.fromArtifact('DAOCommitteeStore');

const DAOElection = contract.fromArtifact('DAOElection');
const DAOElectionProxy = contract.fromArtifact('DAOElectionProxy');
const DAOElectionStore = contract.fromArtifact('DAOElectionStore');

const DAOElectionLottery = contract.fromArtifact('DAOElectionLottery');

const IDAOCommittee = contract.fromArtifact('IDAOCommittee');
*/
//-- setting variables ------------------------------------------------------
const initialSupplyTON = _TON('1000000').toFixed(TON_WEI_UNIT);
const initialSupplyDAOVault = _TON('1000000').toFixed(TON_WEI_UNIT);
//--------------------------------------------------------
//let accounts
let owner, member1, member2, member3, user4, user5, user6 , user7 , user8 , user9 ;
let committee , committeeProxyAddress;
let election, electionProxy; 
let committeeStore, daoVault, daoVaultAddress;
let activityFeeManager , agendaManager, ton, committeeL2Factory; 

let DEF_CreateAgendaFees = '1000000000000000000';
let DEF_ActivityFees = '2000000000000000000';

let gasUsedRecords = [];
let gasUsedTotal = 0;
let now ;
let debugLog=true;
let tx , totalmember , minimunVotingPeriod; 

let CHECK1, CHECK2, CHECK3, CHECK4, CHECK14;
CHECK14 = true;

let minperiodAgendaID , min2periodAgendaID, min3periodAgendaID, min4periodAgendaID;
let minVotingPeriod ,amount,group,target,voteExpirationTime,functionBytecode,description;
let createAgendaFees, tonTotalSupply, agendaID, totalAgendas;
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
let amountTransfer =1000000000000000000; 
 
let actfeeRemainMember1, actfeeRemainMember2, actfeeRemainMember3;
let detailagenda,detailagendaTON;


contract("DAOElection", async accounts => { 

    function todayPrint(intnow){
      now = Date.now() ; 
      if(intnow > 0 ){
        let intnow1=intnow*1000;
        //console.log('now: ',now ); 
        //console.log('intnow1: ',intnow1 );  
        obj = new Date(intnow1); 
        //console.log('check time: ',obj.toString());  
      } 
      objnow = new Date(now); 
      //console.log('current now: ',objnow.toString());  
    }

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

    before(async function () {
      if(debugLog) console.log('accounts :', accounts) ; 
      owner = accounts[0];
      member1 = accounts[1];
      member2 = accounts[2]; 
      member3 = accounts[3]; 
      user4 = accounts[4]; 
      user5 = accounts[5];
      user6 = accounts[6];
      user7 = accounts[7];
      user8 = accounts[8];
      user9= accounts[9]; 

      console.log('addrs ', addrs ) ;
      console.log('l2 ', l2 ) ;
       
      /**
       * 1. DAOVault
       * 2. DAOActivityFeeManager
       * 3. DAOAgendaManager
       * 4. election 
       * 5. commit 
       */
      this.ton = await TON.at(addrs.TON, {from : owner});
      ton = this.ton;  
      if(debugLog) console.log('ton :', this.ton.address) ;
      
      //===================================================       
      this.dAOVault = await DAOVault.new(this.ton.address, {from : owner});
      //await this.ton.mint(this.dAOVault.address, initialSupplyDAOVault, {from : owner});
      daoVault = this.dAOVault ;
      if(debugLog)  console.log('dAOVault :', this.dAOVault.address) ;
       
      let totalTon = await this.ton.totalSupply();
      console.log('totalTon :', _TON(totalTon).toNumber() ) ;
      
      //=================================================== 
      activityFeeManager = await DAOActivityFeeManager.new(this.ton.address, {from : owner});
      await activityFeeManager.setDaoVault(daoVault.address,{from : owner});
      
      //=================================================== 
      agendaManager = await DAOAgendaManager.new(this.ton.address, {from : owner});
      await agendaManager.setActivityFeeManager(activityFeeManager.address, {from : owner});
     
      //=================================================== 
      committeeL2Factory = await CommitteeL2Factory.new( {from : owner});
       
      //===================================================
      this.dAOCommitteeStore = await DAOCommitteeStore.new(this.ton.address , {from : owner});
      committeeStore = this.dAOCommitteeStore;
      
      this.dAOCommittee = await DAOCommittee.new({from : owner}); 
      this.dAOCommitteeProxy = await DAOCommitteeProxy.new(this.dAOCommitteeStore.address, {from : owner});  
      await this.dAOCommitteeStore.transferOwnership(this.dAOCommitteeProxy.address, {from : owner});
      await this.dAOCommitteeProxy.upgradeTo(this.dAOCommittee.address, {from : owner});
      await this.dAOCommitteeProxy.setProxyPause(false, {from : owner});
      await this.dAOCommitteeProxy.setProxyAgendaManager(this.dAOCommittee.address, {from : owner});
      await this.dAOCommitteeProxy.setProxyAactivityfeeManager(this.dAOCommittee.address, {from : owner});
      
      let impl = await this.dAOCommitteeProxy.implementation() ;   

      committee = await DAOCommittee.at(this.dAOCommitteeProxy.address, {from : owner}); 
      // later .. 
      //await committee.setDaoElection(this.dAOCommittee.address, {from : owner});
      await committee.setDaoVault(daoVault.address, {from : owner});
      //
      await daoVault.setDaoCommittee(this.dAOCommitteeProxy.address, {from : owner});
     
      if(debugLog){
        console.log('dAOCommitteeStore :', this.dAOCommitteeStore.address) ; 
        console.log('dAOCommittee :', this.dAOCommittee.address) ;  
        console.log('dAOCommitteeProxy :', this.dAOCommitteeProxy.address) ;
        console.log('dAOCommitteeProxy implementation :', impl) ;
      }  
     
      //=================================================== 
      this.dAOElectionStore = await DAOElectionStore.new(this.ton.address , {from : owner});
      this.dAOElection = await DAOElection.new({from : owner});
      this.dAOElectionProxy = await DAOElectionProxy.new(this.dAOElectionStore.address, {from : owner});  
      await this.dAOElectionStore.transferOwnership(this.dAOElectionProxy.address, {from : owner});
      await this.dAOElectionProxy.upgradeTo(this.dAOElection.address, {from : owner});
      await this.dAOElectionProxy.setProxyPause(false, {from : owner});
      electionProxy = this.dAOElectionProxy;

      /*
      await this.dAOElectionProxy.setProxyDaoCommittee(committee.address, {from : owner});
      await this.dAOElectionProxy.setProxyCommitteeL2Factory(committeeL2Factory.address, {from : owner});
      await this.dAOElectionProxy.setProxyLayer2Registry(addrs.Layer2Registry, {from : owner});
      await this.dAOElectionProxy.setProxySeigManager(addrs.SeigManager, {from : owner});
      */
      let implelection = await this.dAOElectionProxy.implementation() ;
      election = await DAOElection.at(this.dAOElectionProxy.address, {from : owner}); 

      committeeL2Factory.transferOwnership(election.address,  {from : owner});

      if(debugLog){
        console.log('dAOElectionStore :', this.dAOElectionStore.address) ;
        console.log('dAOElection :', this.dAOElection.address) ;
        console.log('dAOElectionProxy :', this.dAOElectionProxy.address) ;
        console.log('dAOElectionProxy implementation :', implelection) ;
      }  
       
      //===================================================
       
      console.log('\n\n');
  }); 

  after(async() => {
    printGasUsed()
  });  
   
  describe("10. Election -> Owner Functions : 오너만 사용할 수 있는 함수를 점검하자. ", async () => {
     
    it("10.2. DaoCommittee 주소 설정은 오너만 할 수 있다. ", async () => {
      await expectRevert.unspecified(electionProxy.setProxyDaoCommittee(committee.address, {from : member1}));
      tx = await electionProxy.setProxyDaoCommittee(committee.address, {from : owner});
      recordGasUsed(tx, 'Election.setProxyDaoCommittee');

      let res = await election.getDaoCommittee(); 
      expect(res).to.equal(committee.address);
    });
    it("10.3. CommitteeLayer2 Factory 주소 설정은 오너만 할 수 있다. ", async () => {
      await expectRevert.unspecified(electionProxy.setProxyCommitteeL2Factory(committeeL2Factory.address, {from : member1}));
      tx = await electionProxy.setProxyCommitteeL2Factory(committeeL2Factory.address, {from : owner});
      recordGasUsed(tx, 'Election.setProxyCommitteeL2Factory');

      let res = await election.getCommitteeL2Factory(); 
      expect(res).to.equal(committeeL2Factory.address);
    });
    it("10.4. Layer2 Registry 설정은 오너만 할 수 있다. ", async () => {
      await expectRevert.unspecified(electionProxy.setProxyLayer2Registry(addrs.Layer2Registry, {from : member1}));
      tx = await electionProxy.setProxyLayer2Registry(addrs.Layer2Registry, {from : owner});
      recordGasUsed(tx, 'Election.setProxyLayer2Registry');

      let res = await election.getLayer2Registry(); 
      expect(res).to.equal(addrs.Layer2Registry);
    });
    it("10.5. SeigManager 설정은 오너만 할 수 있다. ", async () => {
      await expectRevert.unspecified(electionProxy.setProxySeigManager(addrs.SeigManager, {from : member1}));
      tx = await electionProxy.setProxySeigManager(addrs.SeigManager, {from : owner});
      recordGasUsed(tx, 'Election.setProxySeigManager');

      let res = await election.getSeigManager(); 
      expect(res).to.equal(addrs.SeigManager);
    });
    it("10.6. DepositManager 설정은 오너만 할 수 있다. ", async () => {
      await expectRevert.unspecified(election.setDepositManager(addrs.DepositManager, {from : member1}));
      tx = await election.setDepositManager(addrs.DepositManager, {from : owner});
      recordGasUsed(tx, 'Election.setDepositManager');

      let res = await election.getDepositManager(); 
      expect(res).to.equal(addrs.DepositManager);
    });
   
    console.log('\n');
  });

  describe("11. Election -> AnyBody Functions : 누구나 사용할 수 있는 함수를 점검하자. ", async () => {
    it("11.1. CommitteeLayer2를 생성할 수 있다. ", async () => {
      
      tx = await election.createCommitteeLayer2('i am user9', {from : user9});
      recordGasUsed(tx, 'Election.createLayer2');
      expect(verifyEvent(tx, 'CommitteeLayer2Created')).to.be.true; 
    });
 
  });

  describe("12. Election -> Operator Functions : 오퍼레이터만 사용할 수 있는 함수를 점검하자. ", async () => {
  
  });

   
});