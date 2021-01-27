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
  let _committeeProxy, _newton , _newWton ;
  let AbiObject, DaoContractsDeployed ;
    
  
    describe('Agenda - DAOVault2', function () { 
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
        } 
        
        async function addlayer2s(operator){
          let _layer2 = await DaoContractsDeployed.addOperator(operator);
          layer2s.push(_layer2);
        }  

        beforeEach(async function () {  
            this.timeout(1000000);  
        });

                
        it('DAOVault2.setTON ', async function () {  
            this.timeout(1000000);    
            expect(await daoVault2.owner()).to.equal(committeeProxy.address);  
            _newton = await TON.new({from:owner});   
            let params = [_newton.address] ; 
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.setTON,params);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);   
            expect(await daoVault2.ton()).to.equal(_newton.address);   

            params = [ton.address] ; 
            functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.setTON,params);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);  
        });  

        it('DAOVault2.setWTON  ', async function () {  
            this.timeout(1000000);   
            _newWton = await WTON.new(_newton.address,{from:owner}); 
            let params = [_newWton.address] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.setWTON,params);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);   
            expect(await daoVault2.wton()).to.equal(_newWton.address);  

            params = [wton.address] ;
            functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.setWTON,params);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);   
            
        }); 
    
        it('DAOVault2.approveTON  ', async function () {  
            this.timeout(1000000);   
            await ton.transfer(daoVault2.address, TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT),{from:user1});
            let balance = await ton.balanceOf(daoVault2.address);
            (toBN(balance)).should.be.bignumber.equal(toBN(TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT))); 
            let params = [user2, TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT)] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.approveTON,params);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);  
            let allowance =await ton.allowance(daoVault2.address,user2);
            (toBN(allowance)).should.be.bignumber.equal(toBN(TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT)));  
        }); 

        it('DAOVault2.approveWTON  ', async function () {  
            this.timeout(1000000);    
            let allowanceBefore =await wton.allowance(daoVault2.address, user3);
            let params2 = [user3, TON_USER_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT)] ;
            let functionBytecode2 =  web3.eth.abi.encodeFunctionCall(  AbiObject.DAOVault2.approveWTON,params2);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode2);  
            let allowance =await wton.allowance(daoVault2.address,user3);
            (toBN(allowance)).should.be.bignumber.equal(toBN(allowanceBefore).add(toBN(TON_USER_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT))));  
    
        }); 

        it('DAOVault2.approveERC20  ', async function () {  
            this.timeout(1000000);    
            await ton.transfer(daoVault2.address, TON_INITIAL_HOLDERS.toFixed(TON_UNIT),{from:user3}); 
            let params = [ton.address, user4, TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT)] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.approveERC20,params);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);  
            let allowance = await ton.allowance(daoVault2.address,user4);
            (toBN(allowance)).should.be.bignumber.equal(toBN(TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT)));  
        }); 

        it('DAOVault2.claimTON  ', async function () {  
            this.timeout(1000000);    
            let balanceBefore = await ton.balanceOf(user5);   
            let params = [user5 , TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT)] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.claimTON, params); 
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);  
            let balanceAfter = await ton.balanceOf(user5);  
            (toBN(balanceAfter)).should.be.bignumber.equal(toBN(balanceBefore).add(toBN(TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT))));  
        }); 

        it('DAOVault2.claimWTON  ', async function () {  
            this.timeout(1000000);    
            let balanceBefore = await wton.balanceOf(user5);   
            let params = [user5 , TON_USER_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT)] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.claimWTON, params); 
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);  
            let balanceAfter = await wton.balanceOf(user5);  
            (toBN(balanceAfter)).should.be.bignumber.equal(toBN(balanceBefore).add(toBN(TON_USER_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT))));  
        }); 

        it('DAOVault2.claimERC20  ', async function () {  
            this.timeout(1000000);    
            let balanceBefore = await ton.balanceOf(user5);   
            let params = [ ton.address, user5 , TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT)] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.claimERC20, params); 
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);  
            let balanceAfter = await ton.balanceOf(user5);  
            (toBN(balanceAfter)).should.be.bignumber.equal(toBN(balanceBefore).add(toBN(TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT))));  
        });   
    
        it('DAOVault2.transferOwnership', async function () {    
            let params = [user1] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.DAOVault2.transferOwnership, params);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);  
            expect(await daoVault2.owner()).to.equal(user1);  
            await daoVault2.transferOwnership(committeeProxy.address, {from:user1} ); 
        });

        it('DAOVault2.renounceOwnership', async function () {   
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.DAOVault2.renounceOwnership, []);
            await DaoContractsDeployed.executeAgenda(daoVault2.address, functionBytecode);    
            expect(await daoVault2.owner()).to.equal(ZERO_ADDRESS); 
        }); 
}); 