const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const DAOCommitteeProxy = artifacts.require('DAOCommitteeProxy');

module.exports = async function (deployer, network) {
  if (process.env.DEPLOY_COMMITTEE_PROXY) {
    const tonAddress = load(network, "TON");
    const committeeAddress = load(network, "DAOCommittee");
    const seigManagerAddress = load(network, "SeigManager");
    const layer2registryAddress = load(network, "Layer2Registry");
    const agendaManagerAddress = load(network, "DAOAgendaManager");
    const candidateFactoryAddress = load(network, "CandidateFactory");
    const vauleAddress = load(network, "DAOVault");

    let committeeProxy;
    await deployer.deploy(
      DAOCommitteeProxy,
      tonAddress,
      committeeAddress,
      seigManagerAddress,
      layer2registryAddress,
      agendaManagerAddress,
      candidateFactoryAddress,
      vauleAddress
    ).then((_committeeProxy) => {
      committeeProxy = _committeeProxy
    });

    save(
      network, {
        name: "DAOCommitteeProxy",
        address: committeeProxy.address
      }
    );

  }
};
