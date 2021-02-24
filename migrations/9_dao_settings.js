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
    console.log('committeeProxyAddress: ', committeeProxyAddress);
    console.log('daoVault2Address:      ', daoVault2Address);
    console.log('agendaManagerAddress:  ', agendaManagerAddress);
    console.log('committeeAddress:      ', committeeAddress);

    const daoVault2 = await DAOVault.at(daoVault2Address);
    const agendaManager = await DAOAgendaManager.at(agendaManagerAddress);
    const committeeProxy = await DAOCommittee.at(committeeProxyAddress);
    const committee = await DAOCommittee.at(committeeAddress);
    
    console.log('increase max member');
    await committeeProxy.increaseMaxMember(3, 2);
    console.log('done..');

    console.log('trasnfer ownership to comittee proxy');
    await daoVault2.transferOwnership(committeeProxy.address);
    console.log('done..');

    console.log('setCommitte')
    await agendaManager.setCommittee(committeeProxy.address);
    console.log('done..');

    console.log('transfer ownership to committee proxy');
    await agendaManager.transferOwnership(committeeProxy.address);
    console.log('done..');
    //await committee.transferOwnership(committeeProxy.address);

    console.log('grant role to dao Owner');
    await committeeProxy.grantRole(0, daoOwner);
    console.log('done..');

    console.log('renounce owner');
    await committeeProxy.renounceRole(0, deployer);
    console.log('done..');
  }
};
