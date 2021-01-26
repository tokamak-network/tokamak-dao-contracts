const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const { toBN } = require('web3-utils');
const { padLeft } = require('web3-utils');
const { marshalString, unmarshalString } = require('../test/helpers/marshal');

const TON = artifacts.require('TON');
const SeigManager = artifacts.require('SeigManager');
const Layer2Registry = artifacts.require('Layer2Registry');

const EtherToken = artifacts.require('EtherToken');
const EpochHandler = artifacts.require('EpochHandler');
const SubmitHandler = artifacts.require('SubmitHandler');
const Layer2 = artifacts.require('Layer2');

async function addOperator(deployer, operator, network) {
  const tonAddress = load(network, "TON");
  const etherTokenAddress = load(network, "EtherToken");

  let epochHandler;
  let submitHandler;
  let layer2;

  await deployer.deploy(
    EpochHandler
  ).then((_epochHandler) => {
      epochHandler = _epochHandler
    });

  await deployer.deploy(
    SubmitHandler,
    epochHandler.address
  ).then((_submitHandler) => {
      submitHandler = _submitHandler
    });

  const dummyStatesRoot = '0xdb431b544b2f5468e3f771d7843d9c5df3b4edcf8bc1c599f18f0b4ea8709bc3';
  const dummyTransactionsRoot = '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';
  const dummyReceiptsRoot = '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';

  await deployer.deploy(
    Layer2,
    epochHandler.address,
    submitHandler.address,
    etherTokenAddress,
    true,
    1,
    dummyStatesRoot,
    dummyTransactionsRoot,
    dummyReceiptsRoot
  ).then((_layer2) => {
      layer2 = _layer2
    });

  const seigManagerAddress = load(network, "SeigManager");
  const layer2RegistryAddress = load(network, "Layer2Registry");
  const depositManagerAddress = load(network, "DepositManager");
  const wtonAddress = load(network, "WTON");
  const layer2Registry = await Layer2Registry.at(layer2RegistryAddress);
  const seigManager = await SeigManager.at(seigManagerAddress);
  const ton = await TON.at(tonAddress);

  await layer2.setSeigManager(seigManagerAddress);
  await layer2Registry.registerAndDeployCoinage(
    layer2.address,
    seigManagerAddress
  );

  const minimum = await seigManager.minimumAmount();

  const data = marshalString(
    [depositManagerAddress, layer2.address]
      .map(unmarshalString)
      .map(str => padLeft(str, 64))
      .join(''),
  );

  await ton.approveAndCall(
    wtonAddress,
    minimum.div(toBN("1000000000")),
    data
  );

  await layer2.changeOperator(operator);
}

module.exports = async function (deployer, network) {
  if (process.env.TEST_ENV) {
    const tonAddress = load(network, "TON");
    let etherToken;
    await deployer.deploy(
      EtherToken,
      true,
      tonAddress,
      true
    ).then((_etherToken) => {
        etherToken = _etherToken
      });

    save(
      network, {
        name: "EtherToken",
        address: etherToken.address
      }
    );

    await addOperator(deployer, "0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7", network);
    await addOperator(deployer, "0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7", network);
    await addOperator(deployer, "0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD", network);
  }
};
