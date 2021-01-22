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
const DAOCommitteeAbi = require('../build/contracts/DAOCommittee.json').abi;
const DepositManagerAbi = require('../build/contracts/DepositManager.json').abi;
const SeigManagerAbi = require('../build/contracts/SeigManager.json').abi;

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

let ton;
let wton;
let registry;
let depositManager;
let factory;
let daoVault;
let seigManager;
let powerton;

//
let noticePeriod, votingPeriod , agendaFee; 
let layer2s=[];
let AbiObj, DaoContractsDeployed ; 

describe('Test 1', function () {
  before(async function () {
    this.timeout(1000000);


    DaoContractsDeployed = new DaoContracts(); 
    AbiObj = await DaoContractsDeployed.objectMapping(SeigManagerAbi);

    let returnData = await DaoContractsDeployed.initializePlasmaEvmContracts(owner);
    ton = returnData.ton;
    wton = returnData.wton;
    registry = returnData.registry;
    depositManager = returnData.depositManager;
    factory = returnData.coinageFactory;
    daoVault = returnData.daoVault;
    seigManager = returnData.seigManager;
    powerton = returnData.powerton; 

    let returnData1 = await DaoContractsDeployed.initializeDaoContracts(owner);
    daoVault2 = returnData1.daoVault2;
    agendaManager = returnData1.agendaManager;
    candidateFactory = returnData1.candidateFactory;
    committee = returnData1.committee;
    committeeProxy= returnData1.committeeProxy; 

    await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
    await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));  
  });
         
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

  async function NewSeigManager(){
    var newSeigManager = await SeigManager.new(
      ton.address,
      wton.address,
      registry.address,
      depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      factory.address
    ); 

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
  
    await wton.setSeigManager(newSeigManager.address);
    await powerton.setSeigManager(newSeigManager.address);
 
    return newSeigManager;
  }
  
  async function addlayer2s(operator){
    let _layer2 = await DaoContractsDeployed.addOperator(operator);
    layer2s.push(_layer2);
  } 

  async function agendaVoteYesAll(agendaId){
    let quorum = await committeeProxy.quorum();
    let quorumInt = toBN(quorum).toNumber();
    let agenda = await agendaManager.agendas(agendaId);  
    const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP]; 
    time.increaseTo(noticeEndTimestamp); 
    let agendaAfterStartVoting =0;
    let votingEndTimestamp =0;

    for(let i=0; i< candidates.length ; i++ ){
      if(quorumInt >= (i+1)){
        (await DaoContractsDeployed.isVoter(agendaId, candidates[i])).should.be.equal(true);
        const candidateContract = await DaoContractsDeployed.getCandidateContract(candidates[i]);
        await candidateContract.castVote(agendaId, 1,'candidate'+i+' yes', {from: candidates[i]});

        //await committeeProxy.castVote(agendaId,1,' candidate'+i+' yes ', {from: candidates[i]}); 
      }
      if(i==0) {
        agendaAfterStartVoting = await agendaManager.agendas(agendaId);  
      } 
      if(i== (quorumInt-1)) votingEndTimestamp = agendaAfterStartVoting.votingEndTimestamp;  
    }
    
    time.increaseTo(votingEndTimestamp); 
  }  

  async function executeAgenda(_target, _functionBytecode){ 
    let agendaID = await DaoContractsDeployed.createAgenda(_target, _functionBytecode); 
    await agendaVoteYesAll(agendaID); 
    await committeeProxy.executeAgenda(agendaID);   
  } 

  before(async function () { 
    this.timeout(1000000); 

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


  describe('Agenda - seigManager', function () { 

    it('seigManager.transferOwnership to committeeProxy', async function () {  
      await seigManager.transferOwnership(committeeProxy.address);
      expect(await seigManager.owner()).to.equal(committeeProxy.address);
    }); 
    /* 
    it('seigManager.transferCoinageOwnership', async function () {  
      
      let coinages = DaoContractsDeployed.getCoinages();
      let _address =[coinages[2].address, coinages[3].address, coinages[4].address ];
      let _newSeigManager = await NewSeigManager(); 
      let params = [_newSeigManager.address, _address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.transferCoinageOwnership,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      
    } );
    */
   
    it('seigManager.setPowerTON', async function () {  
      
      let _powerton = await NewPowerTON(); 
      let params = [_powerton.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.setPowerTON,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
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
      let _daoVault2 = await DAOVault2.new(ton.address, wton.address,{from:owner}); 
      let params = [_daoVault2.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.setDao,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      expect(await seigManager.dao()).to.equal(_daoVault2.address); 

    });

    it('seigManager.setPowerTONSeigRate setDaoSeigRate setPseigRate ', async function () {  
      this.timeout(1000000);

      const POWERTON_SEIG_RATE_2 = _WTON('0.4'); 
      const DAO_SEIG_RATE_2 = _WTON('0.3');  
      const PSEIG_RATE_2 = _WTON('0.3');  
       
      let params1 = [POWERTON_SEIG_RATE_2.toFixed(WTON_UNIT)] ;
      let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObj.setPowerTONSeigRate,params1); 
      let params2 = [DAO_SEIG_RATE_2.toFixed(WTON_UNIT)] ;
      let functionBytecode2 =  web3.eth.abi.encodeFunctionCall(AbiObj.setDaoSeigRate,params2); 
      let params3 = [PSEIG_RATE_2.toFixed(WTON_UNIT)] ;
      let functionBytecode3 =  web3.eth.abi.encodeFunctionCall(AbiObj.setPseigRate,params3); 
        
      await executeAgenda(
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
      let _factory = await CoinageFactory.new({from:owner});
      let params = [_factory.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.setCoinageFactory,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      expect(await seigManager.factory()).to.equal(_factory.address); 
    });

    it('seigManager.setAdjustDelay', async function () {  
      let params = [5] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.setAdjustDelay,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      (await seigManager.adjustCommissionDelay()).should.be.bignumber.equal(toBN("5"));  
    });
    
    it('seigManager.updateSeigniorage', async function () { 
      this.timeout(1000000);  
      let index=3;  
      let layer2s = await DaoContractsDeployed.getLayer2s();  
      await layer2s[index].updateSeigniorage();  
     
    });

    it('seigManager.setMinimumAmount', async function () {  
      const TON_MINIMUM_STAKE_AMOUNT2 = _TON('2000'); 
      (await seigManager.minimumAmount()).should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT));  

      let params = [TON_MINIMUM_STAKE_AMOUNT2.times(WTON_TON_RATIO).toFixed(WTON_UNIT)] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.setMinimumAmount,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      (await seigManager.minimumAmount()).should.be.bignumber.equal(toBN(TON_MINIMUM_STAKE_AMOUNT2.times(WTON_TON_RATIO).toFixed(WTON_UNIT)));  
    });  
    
    it('seigManager.renounceWTONMinter', async function () {   
      expect(await wton.isMinter(seigManager.address)).to.equal(true);
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renounceWTONMinter,[]); 
      await executeAgenda(seigManager.address, functionBytecode); 
      expect(await wton.isMinter(seigManager.address)).to.equal(false);
      await wton.addMinter(seigManager.address,{from:owner}); 
    }); 
    it('seigManager.transferOwnership(address)  ', async function () {   
      expect(await seigManager.owner()).to.equal(committeeProxy.address);
      let params = [owner] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.transferOwnership2,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      expect(await seigManager.owner()).to.equal(owner);

      await seigManager.transferOwnership(committeeProxy.address); 
      expect(await seigManager.owner()).to.equal(committeeProxy.address);

    }); 
    
    it('seigManager.transferOwnership(address,address)  ', async function () {   
      this.timeout(1000000); 

      expect(await seigManager.owner()).to.equal(committeeProxy.address);
      await powerton.transferOwnership(seigManager.address); 

      let params = [powerton.address, owner] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.transferOwnership,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      expect(await powerton.owner()).to.equal(owner);

      await powerton.transferOwnership(committeeProxy.address); 
      expect(await powerton.owner()).to.equal(committeeProxy.address);

    });   
    it('seigManager.addPauser', async function () { 
      expect(await seigManager.isPauser(user1)).to.equal(false);
      expect(await seigManager.isPauser(committeeProxy.address)).to.equal(false);
      expect(await seigManager.isPauser(owner)).to.equal(true);
      await seigManager.addPauser(committeeProxy.address);

      let params = [user1] ; 
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.addPauser,params); 
      await executeAgenda(seigManager.address, functionBytecode);  
      expect(await seigManager.isPauser(user1)).to.equal(true);
    });  

    it('seigManager.pause', async function () {  
      expect(await seigManager.isPauser(committeeProxy.address)).to.equal(true); 
      let pausedBlock = await seigManager.pausedBlock(); 
      //let unpausedBlock = await seigManager.unpausedBlock(); 
      //let lastSeigBlock = await seigManager.lastSeigBlock(); 
     
      let params = [] ;  
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.pause,params); 
      await executeAgenda(seigManager.address, functionBytecode);  
      let layer2s = await DaoContractsDeployed.getLayer2s();
      expect(layer2s.length).to.gt(0);
      await layer2s[layer2s.length-1].updateSeigniorage(); 
      let pausedBlockAfter = await seigManager.pausedBlock();   
      pausedBlockAfter.should.be.bignumber.gt(pausedBlock); 
    });  

    it('seigManager.unpause', async function () {   
      let pausedBlock = await seigManager.pausedBlock(); 
       let params = [] ;  
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.unpause,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
      let unpausedBlockkAfter = await seigManager.unpausedBlock(); 
      unpausedBlockkAfter.should.be.bignumber.gt(pausedBlock);
    });   

    it('seigManager.renouncePauser(address)', async function () {   
     
      await powerton.addPauser(seigManager.address);
      expect(await powerton.isPauser(seigManager.address)).to.equal(true); 

      let params = [powerton.address] ; 
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renouncePauser,params); 
      await executeAgenda(seigManager.address, functionBytecode);  
      expect(await powerton.isPauser(seigManager.address)).to.equal(false);
    }); 
 

    it('seigManager.renouncePauser()', async function () {  
      expect(await seigManager.isPauser(committeeProxy.address)).to.equal(true);
        
      let params = [] ; 
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renouncePauser2,params); 
      await executeAgenda(seigManager.address, functionBytecode);  
      expect(await seigManager.isPauser(committeeProxy.address)).to.equal(false);
    }); 
 

    it('seigManager.renounceMinter', async function () { 
      expect(await wton.isMinter(seigManager.address)).to.equal(true);
      let params = [wton.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renounceMinter,params); 
      await executeAgenda(seigManager.address, functionBytecode);  
      expect(await wton.isMinter(seigManager.address)).to.equal(false);
     });
 

    it('seigManager.renounceOwnership(address)', async function () {    
      let params1 = [seigManager.address] ;
      let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObj.transferOwnership2,params1); 
 
      let params = [powerton.address] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renounceOwnership,params); 
      await executeAgenda(
        [powerton.address, seigManager.address], [functionBytecode1,functionBytecode]); 
      
        expect(await powerton.owner()).to.equal(ZERO_ADDRESS);

    });  

    it('seigManager.renounceOwnership ', async function () {    
      expect(await seigManager.owner()).to.equal(committeeProxy.address);

      let params = [] ;
      let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renounceOwnership2,params); 
      await executeAgenda(seigManager.address, functionBytecode); 
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
 
});
