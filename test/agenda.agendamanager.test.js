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
  const CandidateAbi = require('../build/contracts/Candidate.json').abi;
  const DAOAgendaManagerAbi = require('../build/contracts/DAOAgendaManager.json').abi;

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
  let _committeeProxy ;

  describe('Test 1', function () {
    before(async function () {
      this.timeout(1000000);
  
  
      DaoContractsDeployed = new DaoContracts(); 
      AbiObj = await DaoContractsDeployed.objectMapping(DAOAgendaManagerAbi);
  
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

    async function NewCommittee(){
        let _daoCommitteeProxy = await DAOCommitteeProxy.new(
            ton.address,
            committee.address,
            seigManager.address,
            registry.address,
            agendaManager.address,
            candidateFactory.address,
            daoVault2.address,
            {from:owner}
          );  
          let impl = await  _daoCommitteeProxy.implementation({from:owner}) ;
      
        _daoCommitteeProxy = await DAOCommittee.at(_daoCommitteeProxy.address,{from:owner});  
        
        return _daoCommitteeProxy; 
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
    /*
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
      */

    async function executeAgenda(_target, _functionBytecode){ 
      let agendaID = await DaoContractsDeployed.createAgenda(_target, _functionBytecode); 
      await DaoContractsDeployed.agendaVoteYesAll(agendaID, committeeProxy); 
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
        _committeeProxy = await NewCommittee();
    });
  
  
    describe('Agenda - AgendaManager', function () {  
         
        
        it('AgendaManager.transferOwnership', async function () { 
            this.timeout(1000000); 

            expect(await agendaManager.owner()).to.equal(committeeProxy.address);  
            let params = [_committeeProxy.address] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.transferOwnership,params);
            await executeAgenda(agendaManager.address, functionBytecode);  
            expect(await agendaManager.owner()).to.equal( _committeeProxy.address);  
        }); 

        it('AgendaManager.renounceOwnership', async function () { 
            this.timeout(1000000); 

            expect(await agendaManager.owner()).to.equal(committeeProxy.address);  
            let params = [] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renounceOwnership,params);
            await executeAgenda(agendaManager.address, functionBytecode);  
            expect(await agendaManager.owner()).to.equal( ZERO_ADDRESS );  
        });  
        
        
        it('AgendaManager.setCommittee', async function () {  
            this.timeout(1000000); 
            
            let params = [_committeeProxy.address] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.setCommittee,params);
            await executeAgenda(agendaManager.address, functionBytecode );  
            expect(await agendaManager.committee()).to.equal(_committeeProxy.address);  
        }); 
        /* 
        it('AgendaManager.renounceOwnership', async function () { 
            this.timeout(1000000); 
            
            let params = [] ; 
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renounceOwnership,params);
            
            let agendaID = await DaoContractsDeployed.createAgenda(agendaManager.address, functionBytecode); 
            
            let agenda = await agendaManager.agendas(agendaID);  
            const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP]; 
            time.increaseTo(noticeEndTimestamp); 
            
            let agendaAfterStartVoting =0;
            let votingEndTimestamp =0;
            await committeeProxy.castVote(agendaID,1,' candidate1 yes ', {from: candidate1} );
            
            agenda = await agendaManager.agendas(agendaID);  
            votingEndTimestamp = agendaAfterStartVoting.votingEndTimestamp;  
            await committeeProxy.castVote(agendaID,1,' candidate2 yes ', {from: candidate2} ); 
            time.increaseTo(votingEndTimestamp);  
            
            await committeeProxy.executeAgenda(agendaID);   
            expect(await agendaManager.owner()).to.equal( ZERO_ADDRESS );  
        });  
        */
    });
   
  });
  