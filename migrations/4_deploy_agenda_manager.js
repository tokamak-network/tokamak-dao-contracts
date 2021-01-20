const { createCurrency } = require('@makerdao/currency');
const fs = require('fs');
const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const DAOAgendaManager = artifacts.require('DAOAgendaManager');

module.exports = async function (deployer, network) {
  if (process.env.DEPLOY_AGENDA_MANAGER) {
    const tonAddress = load(network, "TON");

    let agendaManager;
    await deployer.deploy(
      DAOAgendaManager
    ).then((_agendaManager) => {
      agendaManager = _agendaManager
    });

    save(
      network, {
        name: "DAOAgendaManager",
        address: agendaManager.address
      }
    );

  }
};
