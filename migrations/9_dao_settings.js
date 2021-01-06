const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const DAOVault2 = artifacts.require('DAOVault2');
const DAOAgendaManager = artifacts.require('DAOAgendaManager');
const CandidateFactory = artifacts.require('CandidateFactory');
const DAOCommittee = artifacts.require('DAOCommittee');
const DAOCommitteeProxy = artifacts.require('DAOCommitteeProxy');

module.exports = async function (deployer, network) {
  if (process.env.SET_DAO) {
    const committeeProxyAddress = load(network, "DAOCommitteeProxy");
    const daoVault2Address = load(network, "DAOVault2");
    const agendaManagerAddress = load(network, "DAOAgendaManager");
    const committeeAddress = load(network, "DAOCommittee");

    const daoVault2 = await DAOVault2.at(daoVault2Address);
    const agendaManager = await DAOAgendaManager.at(agendaManagerAddress);
    const committeeProxy = await DAOCommittee.at(committeeProxyAddress);
    const committee = await DAOCommittee.at(committeeAddress);

    await committeeProxy.setMaxMember(3);
    await daoVault2.setDaoCommittee(committeeProxy.address);
    await daoVault2.transferOwnership(committeeProxy.address);
    await agendaManager.setCommittee(committeeProxy.address);
    await agendaManager.transferOwnership(committeeProxy.address);
    await committee.transferOwnership(committeeProxy.address);
  }
};
