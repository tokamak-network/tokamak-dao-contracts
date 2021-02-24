const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const DAOVault = artifacts.require('DAOVault');
const DAOAgendaManager = artifacts.require('DAOAgendaManager');
const CandidateFactory = artifacts.require('CandidateFactory');
const DAOCommittee = artifacts.require('DAOCommittee');
const DAOCommitteeProxy = artifacts.require('DAOCommitteeProxy');

module.exports = async function (deployer, network) {
  if (process.env.SET_DAO) {
    const committeeProxyAddress = load(network, "DAOCommitteeProxy");
    const daoVault2Address = load(network, "DAOVault");
    const agendaManagerAddress = load(network, "DAOAgendaManager");
    const committeeAddress = load(network, "DAOCommittee");

    const daoVault2 = await DAOVault.at(daoVault2Address);
    const agendaManager = await DAOAgendaManager.at(agendaManagerAddress);
    const committeeProxy = await DAOCommittee.at(committeeProxyAddress);
    const committee = await DAOCommittee.at(committeeAddress);

    await committeeProxy.increaseMaxMember(3, 2);
    await daoVault2.transferOwnership(committeeProxy.address);
    await agendaManager.setCommittee(committeeProxy.address);
    await agendaManager.transferOwnership(committeeProxy.address);
  }
};
