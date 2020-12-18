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

const [committee1, committee2, committee3, user1, user2, user3] = accounts;
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

let debugLog=true;

let ton;
let wton;
let registry;
let depositManager;
let factory;
let daoVault;
let seigManager;
let powerton;

describe('Test 1', function () {
  beforeEach(async function () {
    //this.enableTimeouts(false);
    this.timeout(10000000);
  });
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

  async function initializeDaoContracts() {
    this.ton = ton;
    if(debugLog) console.log('ton :', this.ton.address) ;

    //===================================================
    this.dAOVault = await DAOVault2.new(this.ton.address);
    //await this.ton.mint(this.dAOVault.address, initialSupplyDAOVault);
    daoVault = this.dAOVault ;
    if(debugLog)  console.log('dAOVault :', this.dAOVault.address) ;

    let totalTon = await this.ton.totalSupply();
    console.log('totalTon :', _TON(totalTon).toNumber() ) ;

    //===================================================
    activityFeeManager = await DAOActivityFeeManager.new(this.ton.address);
    await activityFeeManager.setDaoVault(daoVault.address);

    //===================================================
    agendaManager = await DAOAgendaManager.new(this.ton.address);
    await agendaManager.setActivityFeeManager(activityFeeManager.address);

    //===================================================
    committeeL2Factory = await CommitteeL2Factory.new();

    //===================================================
    this.dAOCommitteeStore = await DAOCommitteeStore.new(this.ton.address);
    committeeStore = this.dAOCommitteeStore;

    this.dAOCommittee = await DAOCommittee.new();
    this.dAOCommitteeProxy = await DAOCommitteeProxy.new(this.dAOCommitteeStore.address);
    await this.dAOCommitteeStore.transferOwnership(this.dAOCommitteeProxy.address);
    await this.dAOCommitteeProxy.upgradeTo(this.dAOCommittee.address);
    await this.dAOCommitteeProxy.setProxyPause(false);
    await this.dAOCommitteeProxy.setProxyAgendaManager(this.dAOCommittee.address);
    await this.dAOCommitteeProxy.setProxyAactivityfeeManager(this.dAOCommittee.address);

    let impl = await this.dAOCommitteeProxy.implementation() ;

    committee = await DAOCommittee.at(this.dAOCommitteeProxy.address);
    // later ..
    //await committee.setDaoElection(this.dAOCommittee.address);
    await committee.setDaoVault(daoVault.address);
    //
    await daoVault.setDaoCommittee(this.dAOCommitteeProxy.address);

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

    console.log('\n\n');
  }

  describe('Test 1-1', function () {
    beforeEach(async function () {
      await initializePlasmaEvmContracts();
      await initializeDaoContracts();
    });
    it('subtest 1', function () {
    });
  });
});
