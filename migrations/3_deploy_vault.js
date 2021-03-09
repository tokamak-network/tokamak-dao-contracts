const { createCurrency } = require('@makerdao/currency');
const fs = require('fs');
const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const DAOVault = artifacts.require('DAOVault');

module.exports = async function (deployer, network) {
  if (process.env.DEPLOY_VAULT) {
    const tonAddress = load(network, "TON");
    const wtonAddress = load(network, "WTON");

    let vault2;
    await deployer.deploy(
      DAOVault,
      tonAddress,
      wtonAddress
    ).then((_vault2) => {
      vault2 = _vault2
    });

    save(
      network, {
        name: "DAOVault",
        address: vault2.address
      }
    );

  }
};
