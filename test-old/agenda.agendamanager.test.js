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

const DaoContracts = require('../utils/plasma_test_deploy.js');
const DAOCommitteeAbi = require('../build/contracts/DAOCommittee.json').abi;
const DepositManagerAbi = require('../build/contracts/DepositManager.json').abi;
const SeigManagerAbi = require('../build/contracts/SeigManager.json').abi;
const CandidateAbi = require('../build/contracts/Candidate.json').abi;
const DAOAgendaManagerAbi = require('../build/contracts/DAOAgendaManager.json').abi;
const Layer2RegistryAbi = require('../build/contracts/Layer2Registry.json').abi;
const DAOVaultAbi = require('../build/contracts/DAOVault.json').abi;
const TONAbi = require('../build/contracts/TON.json').abi;
const WTONAbi = require('../build/contracts/WTON.json').abi;

// dao-contracts
const DAOVault = contract.fromArtifact('DAOVault');
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
const OldDAOVaultMock = contract.fromArtifact('OldDAOVaultMock');

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
const TON_USER_STAKE_AMOUNT = _TON('10');
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

//
let noticePeriod, votingPeriod , agendaFee;
let layer2s=[];
let AbiObj, DaoContractsDeployed ;
let Layer2RegistryAbiObj, DAOVault2AbiObj, TONAbiObj, WTONAbiObj, SeigManagerAbiObj, DepositManagerAbiObj ;
let _committeeProxy ;

describe('Agenda - AgendaManager', function () {

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
        oldDaoVault = returnData.oldDaoVault;
        seigManager = returnData.seigManager;
        powerton = returnData.powerton;

        let returnData1 = await DaoContractsDeployed.initializeDaoContracts(owner);
        daoVault = returnData1.daoVault;
        agendaManager = returnData1.agendaManager;
        candidateFactory = returnData1.candidateFactory;
        committee = returnData1.committee;
        committeeProxy= returnData1.committeeProxy;

        await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
        await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
    }


    async function NewCommittee(){
        let _daoCommitteeProxy = await DAOCommitteeProxy.new(
            ton.address,
            committee.address,
            seigManager.address,
            registry.address,
            agendaManager.address,
            candidateFactory.address,
            daoVault.address,
            {from:owner}
        );
        let impl = await  _daoCommitteeProxy.implementation({from:owner}) ;

        _daoCommitteeProxy = await DAOCommittee.at(_daoCommitteeProxy.address,{from:owner});

        return _daoCommitteeProxy;
    }

    async function setNewCommittee( _newCommitteeProxy ) {

        await _newCommitteeProxy.increaseMaxMember(3, 2, {from:owner});
        await _newCommitteeProxy.setActivityRewardPerSecond(toBN("1"),{from:owner});

        let params = [_committeeProxy.address] ;
        let functionBytecode1 =  web3.eth.abi.encodeFunctionCall(AbiObject.Layer2Registry.transferOwnership,params);
        let functionBytecode2 =  web3.eth.abi.encodeFunctionCall(AbiObject.DAOVault.transferOwnership,params);
        let functionBytecode3 =  web3.eth.abi.encodeFunctionCall(AbiObject.Agenda.setCommittee,params);
        let functionBytecode4 =  web3.eth.abi.encodeFunctionCall(AbiObject.Agenda.transferOwnership,params);
        let functionBytecode5 =  web3.eth.abi.encodeFunctionCall(AbiObject.TON.addMinter,params);
        let functionBytecode6 =  web3.eth.abi.encodeFunctionCall(AbiObject.TON.transferOwnership2,params);
        let functionBytecode7 =  web3.eth.abi.encodeFunctionCall(AbiObject.WTON.addMinter,params);
        let functionBytecode8 =  web3.eth.abi.encodeFunctionCall(AbiObject.WTON.transferOwnership2,params);
        let functionBytecode9 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.addPauser,params);
        let functionBytecode10 =  web3.eth.abi.encodeFunctionCall(AbiObject.SeigManager.transferOwnership2,params);
        let functionBytecode11 =  web3.eth.abi.encodeFunctionCall(AbiObject.DepositManager.transferOwnership,params);


        /*
        await this.registry.transferOwnership(this.committeeProxy.address,{from:owner});
        await this.daoVault.transferOwnership(this.committeeProxy.address,{from:owner});
        await this.agendaManager.setCommittee(this.committeeProxy.address,{from:owner});
        await this.agendaManager.transferOwnership(this.committeeProxy.address,{from:owner});

        await this.ton.addMinter(this.committeeProxy.address);
        await this.ton.transferOwnership(this.committeeProxy.address);

        await this.wton.addMinter(this.committeeProxy.address);
        await this.wton.transferOwnership(this.committeeProxy.address);

        await this.seigManager.addPauser(this.committeeProxy.address);

        await this.seigManager.transferOwnership(this.committeeProxy.address);
        await this.depositManager.transferOwnership(this.committeeProxy.address);


        // ===
        await _newCommitteeProxy.transferOwnership(this.committeeProxy.address);

        */

        await DaoContractsDeployed.executeAgenda(
        [ registry.address , daoVault.address, agendaManager.address,  agendaManager.address, ton.address,
            ton.address, wton.address, wton.address, seigManager.address, seigManager.address,
            depositManager.address ],
        [ functionBytecode1,functionBytecode2,functionBytecode3,functionBytecode4,functionBytecode5,
            functionBytecode6,functionBytecode7,functionBytecode8,functionBytecode9,functionBytecode10,
            functionBytecode11 ] );


        await DaoContractsDeployed.setDaoContract(
            {
                ton: ton ,
                wton: wton,
                powerton: powerton,
                registry: registry,
                depositManager: depositManager,
                seigManager: seigManager,
                factory: factory,
                daoVault : daoVault,
                agendaManager: agendaManager,
                candidateFactory: candidateFactory,
                committee: committee,
                committeeProxy: _newCommitteeProxy
            }
        );

    }

    async function addlayer2s(operator){
        let _layer2 = await DaoContractsDeployed.addOperator(operator);
        layer2s.push(_layer2);
    }

    beforeEach(async function () {
        this.timeout(1000000);
    });


    it('new _committeeProxy : multi execute : transferOwnership  setCommittee ', async function () {
        this.timeout(1000000);
        _committeeProxy = await NewCommittee();
        await setNewCommittee( _committeeProxy )  ;
        expect(await agendaManager.owner()).to.equal( _committeeProxy.address);
        expect(await seigManager.owner()).to.equal( _committeeProxy.address);
        expect(await depositManager.owner()).to.equal( _committeeProxy.address);
        let data = await DaoContractsDeployed.getDaoContracts();
        expect(await data.committeeProxy.address).to.equal( _committeeProxy.address);
        committeeProxy = _committeeProxy;
    });

        /*
    it('AgendaManager.renounceOwnership', async function () {
        this.timeout(1000000);

        let params = [] ;
        let functionBytecode =  web3.eth.abi.encodeFunctionCall(AbiObj.renounceOwnership,params);
        await executeAgenda(agendaManager.address, functionBytecode);
        expect(await agendaManager.owner()).to.equal( ZERO_ADDRESS );
    });
    */
});
