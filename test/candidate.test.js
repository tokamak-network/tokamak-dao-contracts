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
  AGENDA_RESULT_ACCEPTED,
  AGENDA_RESULT_REJECTED,
  AGENDA_RESULT_DISMISSED,
  VOTER_INFO_ISVOTER,
  VOTER_INFO_HAS_VOTED,
  VOTER_INFO_VOTE
} = require('../utils/constants.js');

// dao-contracts
const DAOVault = contract.fromArtifact('DAOVault');
const DAOCommittee = contract.fromArtifact('DAOCommittee');
//const DAOActivityRewardManager = contract.fromArtifact('DAOActivityRewardManager');
const DAOAgendaManager = contract.fromArtifact('DAOAgendaManager');
const CandidateFactory = contract.fromArtifact('CandidateFactory');
const DAOCommitteeProxy = contract.fromArtifact('DAOCommitteeProxy');
//const DAOElectionStore = contract.fromArtifact('DAOElectionStore');
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
const OldDAOVaultMock = contract.fromArtifact('OldDAOVaultMock');

let o;
process.on('exit', function () {
  console.log(o);
});

const [candidate1, candidate2, candidate3, operator1, operator2, operator3, user1, user2, user3] = accounts;
const candidates = [candidate1, candidate2, candidate3];
const operators = [operator1, operator2, operator3];
const users = [user1, user2, user3];
const deployer = defaultSender;


const _TON = createCurrency('TON');
const _WTON = createCurrency('WTON');
const _WTON_TON = createCurrencyRatio(_WTON, _TON);

const TON_UNIT = 'wei';
const WTON_UNIT = 'ray';
const WTON_TON_RATIO = _WTON_TON('1');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

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

let daoContractsDeployed;

describe('Candidate', function () {
  beforeEach(async function () {
    this.timeout(1000000);

    daoContractsDeployed = new DaoContracts(); 
    const returnData = await daoContractsDeployed.initializePlasmaEvmContracts(owner);
    ton = returnData.ton;
    wton = returnData.wton;
    registry = returnData.registry;
    depositManager = returnData.depositManager;
    factory = returnData.coinageFactory;
    daoVault = returnData.daoVault;
    seigManager = returnData.seigManager;
    powerton = returnData.powerton; 

    const returnData1 = await daoContractsDeployed.initializeDaoContracts(owner);
    daoVault2 = returnData1.daoVault2;
    agendaManager = returnData1.agendaManager;
    candidateFactory = returnData1.candidateFactory;
    committee = returnData1.committee;
    committeeProxy= returnData1.committeeProxy; 

    await candidates.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
    await operators.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));
    await users.map(account => ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT), {from: deployer}));  
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

  async function totalBalanceOfCandidate(candidate) {
    const candidateContractAddress = await committeeProxy.candidateContract(candidate);
    const coinageAddress = await seigManager.coinages(candidateContractAddress);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    return await coinage.totalSupply();
  }

  describe('Candidate', function () {
    it('addCandidate', async function () {
      await candidates.map(account => daoContractsDeployed.addCandidate(account));
    });

    it('addOperator', async function () {
      await operators.map(account => daoContractsDeployed.addOperator(account));
    });
  });

  describe('Member behavior', function () {
    let candidateContracts = []
    let layer2s = []
    beforeEach(async function () {
      this.timeout(1000000);
      layer2s = []
      await candidates.map(account => daoContractsDeployed.addCandidate(account));
      for (let i = 0; i < operators.length; i++) {
        const layer2 = await daoContractsDeployed.addOperator(operators[i])
        await daoContractsDeployed.addCandidateForOperator(operators[i], layer2.address);
        layer2s.push(layer2);
      }

      const slotLength = await committeeProxy.maxMember();
      slotLength.should.be.bignumber.equal(toBN("3"));

      for (let i = 0; i < slotLength; i++) {
        (await committeeProxy.members(i)).should.be.equal(ZERO_ADDRESS);
      }
    });

    it('Memo on dao candidate', async function () {
      const candidate = candidates[0];
      const candidateContract = await daoContractsDeployed.getCandidateContract(candidate);
      const prevMemo = await candidateContract.memo();
      const newMemo = "new memo1234";
      newMemo.should.be.not.equal(prevMemo);
      await committeeProxy.setMemoOnCandidate(candidate, newMemo, {from: candidate});
      (await candidateContract.memo()).should.be.equal(newMemo);
    });

    it('Memo on layer2 candidate', async function () {
      const candidate = operators[0];
      const candidateContract = await daoContractsDeployed.getCandidateContract(layer2s[0].address);
      const prevMemo = await candidateContract.memo();
      const newMemo = "new memo1234";
      newMemo.should.be.not.equal(prevMemo);
      await committeeProxy.setMemoOnCandidate(layer2s[0].address, newMemo, {from: candidate});
      (await candidateContract.memo()).should.be.equal(newMemo);
    });

    it('Memo on dao candidate contract', async function () {
      const candidate = candidates[0];
      const candidateContract = await daoContractsDeployed.getCandidateContract(candidate);
      const prevMemo = await candidateContract.memo();
      const newMemo = "new memo1234";
      newMemo.should.be.not.equal(prevMemo);
      await committeeProxy.setMemoOnCandidateContract(candidateContract.address, newMemo, {from: candidate});
      (await candidateContract.memo()).should.be.equal(newMemo);
    });

    it('Memo on layer2 candidate contract', async function () {
      const candidate = operators[0];
      const candidateContract = await daoContractsDeployed.getCandidateContract(layer2s[0].address);
      const prevMemo = await candidateContract.memo();
      const newMemo = "new memo1234";
      newMemo.should.be.not.equal(prevMemo);
      await committeeProxy.setMemoOnCandidateContract(candidateContract.address, newMemo, {from: candidate});
      (await candidateContract.memo()).should.be.equal(newMemo);
    });

    it('changeMember from candidate', async function () {
      this.timeout(1000000);
      const slotLength = await committeeProxy.maxMember();

      for (let i = 0; i < slotLength; i++) {
        const candidate = candidates[i];
        const candidateContract = await daoContractsDeployed.getCandidateContract(candidate);
        await candidateContract.changeMember(i, {from: candidate});
        (await committeeProxy.members(i)).should.be.equal(candidate);
      }
    });

    it('changeMember from operator', async function () {
      this.timeout(1000000);
      const slotLength = await committeeProxy.maxMember();

      for (let i = 0; i < slotLength; i++) {
        const operator = operators[i];
        const candidateContract = await daoContractsDeployed.getCandidateContract(layer2s[i].address);
        await candidateContract.changeMember(i, {from: operator});
        (await committeeProxy.members(i)).should.be.equal(layer2s[i].address);
      }
    });

    describe('Retire', function () {
      it('retire (dao candidate)', async function () {
        const candidate = candidates[0];
        const candidateContract = await daoContractsDeployed.getCandidateContract(candidate);
        await candidateContract.changeMember(0, {from: candidate});
        (await committeeProxy.members(0)).should.be.equal(candidate);

        (await committeeProxy.isMember(candidate)).should.be.equal(true);
        await candidateContract.retireMember({from: candidate});
        (await committeeProxy.isMember(candidate)).should.be.equal(false);
      });

      it('can not retire by others (dao candidate)', async function () {
        const candidate = candidates[0];
        const candidateContract = await daoContractsDeployed.getCandidateContract(candidate);
        await candidateContract.changeMember(0, {from: candidate});
        (await committeeProxy.members(0)).should.be.equal(candidate);

        (await committeeProxy.isMember(candidate)).should.be.equal(true);
        await expectRevert(
          candidateContract.retireMember({from: candidates[1]}),
          "Candidate: sender is not the candidate of this contract"
        );
      });

      it('retire (operator)', async function () {
        const operator = operators[0];
        const layer2 = layer2s[0];
        const candidateContract = await daoContractsDeployed.getCandidateContract(layer2s[0].address);
        await candidateContract.changeMember(0, {from: operator});
        (await committeeProxy.members(0)).should.be.equal(layer2s[0].address);

        (await committeeProxy.isMember(layer2.address)).should.be.equal(true);
        await candidateContract.retireMember({from: operator});
        (await committeeProxy.isMember(layer2.address)).should.be.equal(false);
      });

      it('can not retire by others (operator)', async function () {
        const operator = operators[0];
        const layer2 = layer2s[0];
        const candidateContract = await daoContractsDeployed.getCandidateContract(layer2s[0].address);
        await candidateContract.changeMember(0, {from: operator});
        (await committeeProxy.members(0)).should.be.equal(layer2s[0].address);

        (await committeeProxy.isMember(layer2.address)).should.be.equal(true);
        await expectRevert(
          candidateContract.retireMember({from: operators[1]}),
          "Candidate: sender is not the operator of this contract"
        );
      });
    });

    async function castVoteOperator(_agendaID, voter, layer2Address, _vote) {
      const agenda1 = await agendaManager.agendas(_agendaID);
      const beforeCountingYes = agenda1[AGENDA_INDEX_COUNTING_YES];
      const beforeCountingNo = agenda1[AGENDA_INDEX_COUNTING_NO];
      const beforeCountingAbstain = agenda1[AGENDA_INDEX_COUNTING_ABSTAIN];

      (await isVoter(_agendaID, layer2Address)).should.be.equal(true);

      await expectRevert.unspecified(
        committeeProxy.endAgendaVoting(_agendaID)
      );

      const candidateContract = await daoContractsDeployed.getCandidateContract(layer2Address);
      await candidateContract.castVote(_agendaID, _vote, "test comment", {from: voter});

      const voterInfo2 = await agendaManager.voterInfos(_agendaID, layer2Address);
      voterInfo2[VOTER_INFO_ISVOTER].should.be.equal(true);
      voterInfo2[VOTER_INFO_HAS_VOTED].should.be.equal(true);
      voterInfo2[VOTER_INFO_VOTE].should.be.bignumber.equal(toBN(_vote));

      const agenda2 = await agendaManager.agendas(_agendaID);
      agenda2[AGENDA_INDEX_COUNTING_YES].should.be.bignumber.equal(beforeCountingYes.add(_vote === VOTE_YES ? toBN(1) : toBN(0)));
      agenda2[AGENDA_INDEX_COUNTING_NO].should.be.bignumber.equal(beforeCountingNo.add(_vote === VOTE_NO ? toBN(1) : toBN(0)));
      agenda2[AGENDA_INDEX_COUNTING_ABSTAIN].should.be.bignumber.equal(beforeCountingAbstain.add(_vote === VOTE_ABSTAIN ? toBN(1) : toBN(0)));

      const result = await agendaManager.getVoteStatus(_agendaID, layer2Address);
      result[0].should.be.equal(true);
      result[1].should.be.bignumber.equal(toBN(_vote));
    }

    async function castVote(_agendaID, voter, _vote) {
      const agenda1 = await agendaManager.agendas(_agendaID);
      const beforeCountingYes = agenda1[AGENDA_INDEX_COUNTING_YES];
      const beforeCountingNo = agenda1[AGENDA_INDEX_COUNTING_NO];
      const beforeCountingAbstain = agenda1[AGENDA_INDEX_COUNTING_ABSTAIN];

      (await isVoter(_agendaID, voter)).should.be.equal(true);

      await expectRevert.unspecified(
        committeeProxy.endAgendaVoting(_agendaID)
      );

      const candidateContract = await daoContractsDeployed.getCandidateContract(voter);
      await candidateContract.castVote(_agendaID, _vote, "test comment", {from: voter});

      const voterInfo2 = await agendaManager.voterInfos(_agendaID, voter);
      voterInfo2[VOTER_INFO_ISVOTER].should.be.equal(true);
      voterInfo2[VOTER_INFO_HAS_VOTED].should.be.equal(true);
      voterInfo2[VOTER_INFO_VOTE].should.be.bignumber.equal(toBN(_vote));

      const agenda2 = await agendaManager.agendas(_agendaID);
      agenda2[AGENDA_INDEX_COUNTING_YES].should.be.bignumber.equal(beforeCountingYes.add(_vote === VOTE_YES ? toBN(1) : toBN(0)));
      agenda2[AGENDA_INDEX_COUNTING_NO].should.be.bignumber.equal(beforeCountingNo.add(_vote === VOTE_NO ? toBN(1) : toBN(0)));
      agenda2[AGENDA_INDEX_COUNTING_ABSTAIN].should.be.bignumber.equal(beforeCountingAbstain.add(_vote === VOTE_ABSTAIN ? toBN(1) : toBN(0)));

      const result = await agendaManager.getVoteStatus(_agendaID, voter);
      result[0].should.be.equal(true);
      result[1].should.be.bignumber.equal(toBN(_vote));
    }

    async function isVoter(_agendaID, voter) {
      const candidateContract = await daoContractsDeployed.getCandidateContract(voter);
      const agenda = await agendaManager.agendas(_agendaID);

      if (agenda[AGENDA_INDEX_STATUS] == AGENDA_STATUS_NOTICE)
        return (await committeeProxy.isMember(voter));
      else
        return (await agendaManager.isVoter(_agendaID, voter));
    }

    describe('Voting', function () {
      let agendaID;
      beforeEach(async function () {
        this.timeout(1000000);
        const candidateContract1 = await daoContractsDeployed.getCandidateContract(candidates[0]);
        await candidateContract1.changeMember(0, {from: candidates[0]});
        (await committeeProxy.members(0)).should.be.equal(candidates[0]);

        const candidateContract2 = await daoContractsDeployed.getCandidateContract(layer2s[0].address);
        await candidateContract2.changeMember(1, {from: operators[0]});
        (await committeeProxy.members(1)).should.be.equal(layer2s[0].address);

        const candidateContract3 = await daoContractsDeployed.getCandidateContract(layer2s[1].address);
        await candidateContract3.changeMember(2, {from: operators[1]});
        (await committeeProxy.members(2)).should.be.equal(layer2s[1].address);

        const noticePeriod = await agendaManager.minimumNoticePeriodSeconds();
        const votingPeriod = await agendaManager.minimumVotingPeriodSeconds();
        const selector = web3.eth.abi.encodeFunctionSignature("setMinimumNoticePeriodSeconds(uint256)");
        const newMinimumNoticePeriod = 10;
        const data = padLeft(newMinimumNoticePeriod.toString(16), 64);
        const functionBytecode = selector.concat(data);

        const param = web3.eth.abi.encodeParameters(
          ["address[]", "uint256", "uint256", "bytes[]"],
          [[agendaManager.address], noticePeriod.toString(), votingPeriod.toString(), [functionBytecode]]
        );

        const beforeBalance = await ton.balanceOf(user1);
        const agendaFee = await agendaManager.createAgendaFees();
        agendaFee.should.be.bignumber.gt(toBN("0"));

        // create agenda
        await ton.approveAndCall(
          committeeProxy.address,
          agendaFee,
          param,
          {from: user1}
        );
        const afterBalance = await ton.balanceOf(user1);
        afterBalance.should.be.bignumber.lt(beforeBalance);
        beforeBalance.sub(afterBalance).should.be.bignumber.equal(agendaFee);

        agendaID = (await agendaManager.numAgendas()).sub(toBN("1"));
        const executionInfo = await agendaManager.getExecutionInfo(agendaID);
        executionInfo[0][0].should.be.equal(agendaManager.address);
        executionInfo[1][0].should.be.equal(functionBytecode);

        const agenda = await agendaManager.agendas(agendaID);  
        const noticeEndTimestamp = agenda[AGENDA_INDEX_NOTICE_END_TIMESTAMP];
        await time.increaseTo(noticeEndTimestamp);
        (await agendaManager.isVotableStatus(agendaID)).should.be.equal(true);
      });

      it('cast vote', async function () {
        console.log(`member 0: ${await committeeProxy.members(0)}`);
        console.log(`member 1: ${await committeeProxy.members(1)}`);
        console.log(`member 2: ${await committeeProxy.members(2)}`);
        console.log(`candidates[0]: ${candidates[0]}`);
        await castVote(agendaID, candidates[0], VOTE_YES);
        await castVoteOperator(agendaID, operators[0], layer2s[0].address, VOTE_YES);

        const agenda = await agendaManager.agendas(agendaID);
        agenda[AGENDA_INDEX_RESULT].should.be.bignumber.equal(toBN(AGENDA_RESULT_ACCEPTED));
        agenda[AGENDA_INDEX_STATUS].should.be.bignumber.equal(toBN(AGENDA_STATUS_WAITING_EXEC));
      });

      it('can not cast vote by others (dao candidate)', async function () {
        const candidateContract = await daoContractsDeployed.getCandidateContract(candidates[0]);
        await expectRevert(
          candidateContract.castVote(agendaID, VOTE_YES, "test comment", {from: candidates[1]}),
          "Candidate: sender is not the candidate of this contract"
        );
      });

      it('can not cast vote by others (operator)', async function () {
        const candidateContract = await daoContractsDeployed.getCandidateContract(layer2s[0].address);
        await expectRevert(
          candidateContract.castVote(agendaID, VOTE_YES, "test comment", {from: operators[1]}),
          "Candidate: sender is not the operator of this contract"
        );
      });
    });
  });
});
