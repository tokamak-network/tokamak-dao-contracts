const { createCurrency } = require('@makerdao/currency');
const fs = require('fs');
const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const DAOVault2 = artifacts.require('DAOVault2');

module.exports = async function (deployer, network) {
  if (process.env.DEPLOY_VAULT) {
    const tonAddress = load(network, "TON");
    const wtonAddress = load(network, "WTON");

    let vault2;
    await deployer.deploy(
      DAOVault2,
      tonAddress,
      wtonAddress
    ).then((_vault2) => {
      vault2 = _vault2
    });

    save(
      network, {
        name: "DAOVault2",
        address: vault2.address
      }
    );

  }
};
