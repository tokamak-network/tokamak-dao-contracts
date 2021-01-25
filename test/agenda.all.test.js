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
  let _committeeProxy, _newton , _newWton, _newLayer2 ;
  let AbiObject, DaoContractsDeployed ;
   

  describe('Test 1', function () {
    before(async function () {
      this.timeout(1000000);  
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
    
    async function addlayer2s(operator){
      let _layer2 = await DaoContractsDeployed.addOperator(operator);
      layer2s.push(_layer2);
    } 

    async function newLayer2(operator){
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

        await layer2.setSeigManager( seigManager.address, {from: operator});
        
        return layer2; 
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
   ///await wton.addMinter(newSeigManager.address);
    //await ton.addMinter(wton.address);
     
    newSeigManager.setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT));
    newSeigManager.setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT));
    newSeigManager.setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT));
    await newSeigManager.setMinimumAmount(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT))
    
     
    return newSeigManager;
  }

  describe('Agenda - depositManager', function () { 
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
    
    it('depositManager.deposit ', async function () {  
        const stakeAmountTON = TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT);
        const stakeAmountWTON = TON_USER_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);

        await DaoContractsDeployed.deposit(layer2s[0].address, user1, stakeAmountTON); 
        let stakedAmountWTON = await DaoContractsDeployed.balanceOfAccountByLayer2(layer2s[0].address, user1);
        stakedAmountWTON.should.be.bignumber.equal(stakeAmountWTON);
        
    });  

    it('depositManager.setGlobalWithdrawalDelay', async function () {    
       
        (await depositManager.globalWithdrawalDelay()).should.be.bignumber.equal(toBN(WITHDRAWAL_DELAY));  
        let params = [15] ;
        let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.DepositManager.setGlobalWithdrawalDelay,params);
        await DaoContractsDeployed.executeAgenda(depositManager.address, functionBytecode);   
        (await depositManager.globalWithdrawalDelay()).should.be.bignumber.equal(toBN("15")); 
    });
        
    it('depositManager.setSeigManager', async function () {  
        
        let _newSeigManager = await NewSeigManager(); 
        let params = [_newSeigManager.address] ;
        let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.DepositManager.setSeigManager,params);
        
        await DaoContractsDeployed.executeAgenda(depositManager.address, functionBytecode);   
        (await depositManager.seigManager()).should.be.equal(_newSeigManager.address); 
        let data = {
        seigManager: _newSeigManager,
        ton: ton,
        wton: wton,
        powerton: powerton,
        registry: registry,
        depositManager: depositManager,
        factory: factory,
        } ;
        await DaoContractsDeployed.setDaoContract(data);
    });
        
    it('depositManager.deposit by new user after setSeigManager - fail ', async function () {  

        let stakeAmountTON = TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT);
        let stakeAmountWTON = TON_USER_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
        await DaoContractsDeployed.deposit(layer2s[0].address, user2, stakeAmountTON);
        let stakedAmountWTON = await DaoContractsDeployed.balanceOfAccountByLayer2(layer2s[0].address, user2);
        stakedAmountWTON.should.be.bignumber.equal(stakeAmountWTON);
        
    });
    
    it('depositManager.deposit by staked user after setSeigManager - fail ', async function () {  
    
        const TON_USER_STAKE_AMOUNT2 = _TON('20');
        let stakeAmountTON = TON_USER_STAKE_AMOUNT.toFixed(TON_UNIT);
        let stakeAmountWTON = TON_USER_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
        let stakeAmountWTON2 = TON_USER_STAKE_AMOUNT2.times(WTON_TON_RATIO).toFixed(WTON_UNIT);

        await DaoContractsDeployed.deposit(layer2s[0].address, user1, stakeAmountTON);
        let stakedAmountWTON = await DaoContractsDeployed.balanceOfAccountByLayer2(layer2s[0].address, user1);
        stakedAmountWTON.should.be.bignumber.equal(stakeAmountWTON2);
        
    });
        
    it('depositManager.transferOwnership', async function () {    
        let params = [user1] ;
        let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.DepositManager.transferOwnership, params);
        await DaoContractsDeployed.executeAgenda(depositManager.address, functionBytecode);    
        expect(await depositManager.owner()).to.equal(user1); 

        await depositManager.transferOwnership(committeeProxy.address, {from:user1} );

    });
    it('committeeProxy.renounceOwnership', async function () {   
        let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.DepositManager.renounceOwnership, []);
        await DaoContractsDeployed.executeAgenda(depositManager.address, functionBytecode);    
        expect(await depositManager.owner()).to.equal(ZERO_ADDRESS); 
    });
}); 

      
    describe('Agenda - Layer2Registry', function () { 

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
        
        it('Layer2Registry.register deployCoinage ', async function () {  
            this.timeout(1000000);    
            expect(await registry.owner()).to.equal(committeeProxy.address);   
            _newLayer2 = await newLayer2(user1); 
            let params = [_newLayer2.address] ; 
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.Layer2Registry.register,params);
            let params1 = [_newLayer2.address, seigManager.address ] ; 
            let functionBytecode1 =  web3.eth.abi.encodeFunctionCall( AbiObject.Layer2Registry.deployCoinage,params1);
            await DaoContractsDeployed.executeAgenda(
                [registry.address,registry.address], [functionBytecode,functionBytecode1 ]);    
            expect(await registry.layer2s(_newLayer2.address)).to.equal(true);   
    
        });  

        it('Layer2Registry.registerAndDeployCoinage ', async function () {  
            this.timeout(1000000);    
            expect(await registry.owner()).to.equal(committeeProxy.address);   
            let _newLayer2_1 = await newLayer2(user2); 
            let params = [_newLayer2_1.address, seigManager.address] ; 
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.Layer2Registry.registerAndDeployCoinage,params);
            
            await DaoContractsDeployed.executeAgenda(
                registry.address, functionBytecode);    
            expect(await registry.layer2s(_newLayer2_1.address)).to.equal(true);    
        });  


        it('Layer2Registry.registerAndDeployCoinageAndSetCommissionRate ', async function () {  
            this.timeout(1000000);    
            const COMMISION_RATE = _WTON('0.01').toFixed(WTON_UNIT);

            expect(await registry.owner()).to.equal(committeeProxy.address);   
            let _newLayer2_1 = await newLayer2(user3); 
            //10 ** 25 isCommissionRateNegative
            let params = [_newLayer2_1.address, seigManager.address, COMMISION_RATE, true ] ; 
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.Layer2Registry.registerAndDeployCoinageAndSetCommissionRate,params);
            
            await DaoContractsDeployed.executeAgenda(
                registry.address, functionBytecode);    
            expect(await registry.layer2s(_newLayer2_1.address)).to.equal(true);  
        });  

        it('Layer2Registry.unregister ', async function () {  
            this.timeout(1000000);    
            expect(await registry.owner()).to.equal(committeeProxy.address);    
            let params = [_newLayer2.address ] ; 
            let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.Layer2Registry.unregister,params);
            
            await DaoContractsDeployed.executeAgenda(
                registry.address, functionBytecode);    
            expect(await registry.layer2s(_newLayer2.address)).to.equal(false);  
        });  
    
        it('Layer2Registry.transferOwnership', async function () {    
            let params = [user1] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.Layer2Registry.transferOwnership, params);
            await DaoContractsDeployed.executeAgenda(registry.address, functionBytecode);    
            expect(await registry.owner()).to.equal(user1); 
    
            await registry.transferOwnership(committeeProxy.address, {from:user1} ); 
        });

        it('Layer2Registry.renounceOwnership', async function () {   
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.Layer2Registry.renounceOwnership, []);
            await DaoContractsDeployed.executeAgenda(registry.address, functionBytecode);    
            expect(await registry.owner()).to.equal(ZERO_ADDRESS); 
        });
    });
    

    describe('Agenda - seigManager', function () {  

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

        it('seigManager.setPowerTON', async function () {  
          this.timeout(1000000); 
          let _powerton = await NewPowerTON(); 
          let params = [_powerton.address] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall( AbiObject.SeigManager.setPowerTON,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
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
          this.timeout(1000000); 
          let _daoVault2 = await DAOVault2.new(ton.address, wton.address,{from:owner}); 
          let params = [_daoVault2.address] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setDao,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          expect(await seigManager.dao()).to.equal(_daoVault2.address); 
    
        });
    
        it('seigManager.setPowerTONSeigRate setDaoSeigRate setPseigRate ', async function () {  
          this.timeout(1000000);
    
          const POWERTON_SEIG_RATE_2 = _WTON('0.4'); 
          const DAO_SEIG_RATE_2 = _WTON('0.3');  
          const PSEIG_RATE_2 = _WTON('0.3');  
           
          let params1 = [POWERTON_SEIG_RATE_2.toFixed(WTON_UNIT)] ;
          let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setPowerTONSeigRate,params1); 
          let params2 = [DAO_SEIG_RATE_2.toFixed(WTON_UNIT)] ;
          let functionBytecode2 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setDaoSeigRate,params2); 
          let params3 = [PSEIG_RATE_2.toFixed(WTON_UNIT)] ;
          let functionBytecode3 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setPseigRate,params3); 
            
          await DaoContractsDeployed.executeAgenda(
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
          this.timeout(1000000);  
          let _factory = await CoinageFactory.new({from:owner});
          let params = [_factory.address] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setCoinageFactory,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          expect(await seigManager.factory()).to.equal(_factory.address); 
        });
    
        it('seigManager.setAdjustDelay', async function () {  
          this.timeout(1000000);  
          let params = [5] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setAdjustDelay,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          (await seigManager.adjustCommissionDelay()).should.be.bignumber.equal(toBN("5"));  
        });
        
        it('seigManager.updateSeigniorage', async function () { 
          this.timeout(1000000);  
          let index=3;  
          let layer2s = await DaoContractsDeployed.getLayer2s();  
          await layer2s[index].updateSeigniorage();  
         
        });
    
        it('seigManager.setMinimumAmount', async function () {  
          this.timeout(1000000);  
          const TON_MINIMUM_STAKE_AMOUNT2 = _TON('2000'); 
          (await seigManager.minimumAmount()).should.be.bignumber.equal(TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT));  
    
          let params = [TON_MINIMUM_STAKE_AMOUNT2.times(WTON_TON_RATIO).toFixed(WTON_UNIT)] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.setMinimumAmount,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          (await seigManager.minimumAmount()).should.be.bignumber.equal(toBN(TON_MINIMUM_STAKE_AMOUNT2.times(WTON_TON_RATIO).toFixed(WTON_UNIT)));  
        });  
        
        it('seigManager.renounceWTONMinter', async function () {   
          this.timeout(1000000);  
          expect(await wton.isMinter(seigManager.address)).to.equal(true);
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceWTONMinter,[]); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          expect(await wton.isMinter(seigManager.address)).to.equal(false);
    
          let params1 = [seigManager.address] ;
          let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.WTON.addMinter,params1); 
          await DaoContractsDeployed.executeAgenda(wton.address, functionBytecode1); 
          expect(await wton.isMinter(seigManager.address)).to.equal(true);  
        }); 
    
        it('seigManager.transferOwnership(address)  ', async function () {   
          expect(await seigManager.owner()).to.equal(committeeProxy.address);
          let params = [owner] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.transferOwnership2,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          expect(await seigManager.owner()).to.equal(owner);
    
          await seigManager.transferOwnership(committeeProxy.address); 
          expect(await seigManager.owner()).to.equal(committeeProxy.address);
    
        }); 
        
        it('seigManager.transferOwnership(address,address)  ', async function () {   
          this.timeout(1000000); 
    
          expect(await seigManager.owner()).to.equal(committeeProxy.address);
          await powerton.transferOwnership(seigManager.address); 
    
          let params = [powerton.address, owner] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.transferOwnership,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          expect(await powerton.owner()).to.equal(owner);
    
          await powerton.transferOwnership(committeeProxy.address); 
          expect(await powerton.owner()).to.equal(committeeProxy.address);
    
        });   
        it('seigManager.addPauser', async function () { 
          this.timeout(1000000); 
          expect(await seigManager.isPauser(user1)).to.equal(false);
          let params = [user1] ; 
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.addPauser,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);  
          expect(await seigManager.isPauser(user1)).to.equal(true);
        });  
    
        it('seigManager.pause', async function () {  
          this.timeout(1000000); 
          expect(await seigManager.isPauser(committeeProxy.address)).to.equal(true); 
          let pausedBlock = await seigManager.pausedBlock();  
          let params = [] ;  
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.pause,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);  
          let layer2s = await DaoContractsDeployed.getLayer2s();
          expect(layer2s.length).to.gt(0);
          await layer2s[layer2s.length-1].updateSeigniorage(); 
          let pausedBlockAfter = await seigManager.pausedBlock();   
          pausedBlockAfter.should.be.bignumber.gt(pausedBlock); 
        });  
    
        it('seigManager.unpause', async function () {   
          this.timeout(1000000); 
          let pausedBlock = await seigManager.pausedBlock(); 
           let params = [] ;  
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.unpause,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
          let unpausedBlockkAfter = await seigManager.unpausedBlock(); 
          unpausedBlockkAfter.should.be.bignumber.gt(pausedBlock);
        });   
    
        it('seigManager.renouncePauser(address)', async function () {   
          this.timeout(1000000); 
          await powerton.addPauser(seigManager.address);
          expect(await powerton.isPauser(seigManager.address)).to.equal(true);  
          let params = [powerton.address] ; 
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renouncePauser,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);  
          expect(await powerton.isPauser(seigManager.address)).to.equal(false);
        }); 
     
    
        it('seigManager.renouncePauser()', async function () {  
          this.timeout(1000000); 
          expect(await seigManager.isPauser(committeeProxy.address)).to.equal(true); 
          let params = [] ; 
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renouncePauser2,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);  
          expect(await seigManager.isPauser(committeeProxy.address)).to.equal(false);
        }); 
     
    
        it('seigManager.renounceMinter', async function () { 
          this.timeout(1000000); 
          expect(await wton.isMinter(seigManager.address)).to.equal(true);
          let params = [wton.address] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceMinter,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode);  
          expect(await wton.isMinter(seigManager.address)).to.equal(false);
         });
     
    
        it('seigManager.renounceOwnership(address)', async function () {    
          let params1 = [seigManager.address] ;
          let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.transferOwnership2,params1); 
     
          let params = [powerton.address] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceOwnership,params); 
          await DaoContractsDeployed.executeAgenda(
            [powerton.address, seigManager.address], [functionBytecode1,functionBytecode]); 
          
            expect(await powerton.owner()).to.equal(ZERO_ADDRESS);
    
        });  
    
        it('seigManager.renounceOwnership ', async function () {    
          this.timeout(1000000); 
          expect(await seigManager.owner()).to.equal(committeeProxy.address); 
          let params = [] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.renounceOwnership2,params); 
          await DaoContractsDeployed.executeAgenda(seigManager.address, functionBytecode); 
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


    describe('Agenda - DAOCommitteeProxy', function () { 

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

            _committeeProxy = await DAOCommitteeProxy.at(committeeProxy.address); 
        }); 

        it('DAOCommitteeProxy.upgradeTo ', async function () {  
          this.timeout(1000000);   
          let _newImp =  await DAOCommittee.new({from:owner});  
          let oldImp = await _committeeProxy.implementation();
  
          expect(oldImp).to.not.equal(_newImp.address); 
          
          let params = [_newImp.address] ;
          let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.CommitteeProxy.upgradeTo,params);
          await DaoContractsDeployed.executeAgenda(_committeeProxy.address, functionBytecode);   
          expect(await _committeeProxy._implementation()).to.equal(_newImp.address);  
  
          params = [oldImp] ;
          functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.CommitteeProxy.upgradeTo,params);
          await DaoContractsDeployed.executeAgenda(_committeeProxy.address, functionBytecode);   
          expect(await _committeeProxy._implementation()).to.equal(oldImp);  
  
        });  
        it('DAOCommitteeProxy.setProxyPause - true ', async function () {  
            this.timeout(1000000);   
  
            expect(await _committeeProxy.pauseProxy()).to.equal(false); 
            let params = [true] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.CommitteeProxy.setProxyPause,params);
            await DaoContractsDeployed.executeAgenda(_committeeProxy.address, functionBytecode);   
            expect(await _committeeProxy.pauseProxy()).to.equal(true);  
        }); 
        
        it('DAOCommitteeProxy.setProxyPause - false ', async function () {  
            this.timeout(1000000);   
    
            expect(await _committeeProxy.pauseProxy()).to.equal(true); 
            let params = [false] ;
            let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObject.CommitteeProxy.setProxyPause,params);
            await DaoContractsDeployed.executeAgenda(_committeeProxy.address, functionBytecode);   
            expect(await _committeeProxy.pauseProxy()).to.equal(false);  
        }); 
      
   
    });

  });
  