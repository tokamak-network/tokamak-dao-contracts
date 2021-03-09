const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const Layer2Registry = artifacts.require('Layer2Registry');
const DepositManager = artifacts.require('DepositManager');
const SeigManager = artifacts.require('SeigManager');

module.exports = async function (deployer, network) {
  if (process.env.SET_PLASMA_EVM) {
    const layer2RegistryAddress = load(network, "Layer2Registry");
    const depositManagerAddress = load(network, "DepositManager");
    const seigManagerAddress = load(network, "SeigManager");
    const committeeProxyAddress = load(network, "DAOCommitteeProxy");

    const registry = await Layer2Registry.at(layer2RegistryAddress);
    const depositManager = await DepositManager.at(depositManagerAddress);
    const seigManager = await SeigManager.at(seigManagerAddress);

    await registry.transferOwnership(committeeProxyAddress);
    await depositManager.transferOwnership(committeeProxyAddress);
    await seigManager.transferOwnership(committeeProxyAddress);
  }
};
