const { createCurrency } = require('@makerdao/currency');
const fs = require('fs');
const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const _WTON = createCurrency('WTON');

const TON = artifacts.require('TON');
const WTON = artifacts.require('WTON');
const Layer2Registry = artifacts.require('Layer2Registry');
const DepositManager = artifacts.require('DepositManager');
const SeigManager = artifacts.require('SeigManager');
const CoinageFactory = artifacts.require('CoinageFactory');
const PowerTON = artifacts.require('PowerTON');
const DAOVault = artifacts.require('DAOVault');

// 1024 blocks
// 93046 blocks (= 2 weeks)
const WITHDRAWAL_DELAY_MAINNET = 93046;
const WITHDRAWAL_DELAY_RINKEBY = Math.floor(WITHDRAWAL_DELAY_MAINNET / (14 * 24 * 2)); // 30 min

// 1209600 sec (= 2 weeks)
const ROUND_DURATION_MAINNET = 1209600;
const ROUND_DURATION_RINKEBY = Math.floor(ROUND_DURATION_MAINNET / (14 * 24 * 2)); // 30 min

// 100 WTON per block as seigniorage
const SEIG_PER_BLOCK = process.env.SEIG_PER_BLOCK || '3.92';

module.exports = async function (deployer, network) {
  if (process.env.DEPLOY_PLASMA_EVM) {
    let ton;
    await deployer.deploy(TON)
      .then((_ton) => {
        ton = _ton;
      });
    save(
      network, {
        name: "TON",
        address: ton.address
      }
    );

    let wton;
    let registry;
    let depositManager;
    let factory;
    let daoVault;
    let seigManager;
    let powerton;

    await deployer.deploy(WTON, ton.address)
      .then((_wton) => {
        wton = _wton;
      });
    save(
      network, {
        name: "WTON",
        address: wton.address
      }
    );

    await deployer.deploy(Layer2Registry)
      .then((_registry) => {
        registry = _registry;
      });

    save(
      network, {
        name: "Layer2Registry",
        address: registry.address
      }
    );

    await deployer.deploy(
      DepositManager,
      wton.address,
      registry.address,
      WITHDRAWAL_DELAY_RINKEBY,
    )
      .then((_depositManager) => {
        depositManager = _depositManager;
      });

    save(
      network, {
        name: "DepositManager",
        address: depositManager.address
      }
    );

    await deployer.deploy(CoinageFactory)
      .then((_factory) => {
        factory = _factory;
      });

    save(
      network, {
        name: "CoinageFactory",
        address: factory.address
      }
    );

    await deployer.deploy(DAOVault, wton.address, 1609416000)
      .then((_daoVault) => {
        daoVault = _daoVault;
      });

    save(
      network, {
        name: "DaoVault",
        address: daoVault.address
      }
    );

    await deployer.deploy(
      SeigManager,
      ton.address,
      wton.address,
      registry.address,
      depositManager.address,
      _WTON(SEIG_PER_BLOCK).toFixed('ray'),
      factory.address,
    )
      .then((_seigManager) => {
        seigManager = _seigManager;
      });

    save(
      network, {
        name: "SeigManager",
        address: seigManager.address
      }
    );

    await deployer.deploy(
      PowerTON,
      seigManager.address,
      wton.address,
      ROUND_DURATION_RINKEBY,
    )
      .then((_powerton) => {
        powerton = _powerton;
      });

    save(
      network, {
        name: "PowerTON",
        address: powerton.address
      }
    );
  }
};
