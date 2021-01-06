const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const Layer2Registry = artifacts.require('Layer2Registry');

module.exports = async function (deployer, network) {
  if (process.env.SET_PLASMA_EVM) {
    const layer2RegistryAddress = load(network, "Layer2Registry");
    const committeeProxyAddress = load(network, "DAOCommitteeProxy");

    const registry = await Layer2Registry.at(layer2RegistryAddress);

    await registry.transferOwnership(committeeProxyAddress);
  }
};
