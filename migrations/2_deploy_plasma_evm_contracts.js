const { createCurrency } = require('@makerdao/currency');
const fs = require('fs');

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

//const TON_MAINNET = '0x2be5e8c109e2197d077d13a82daead6a9b3433c5';
//const TON_RINKEBY = '0x3734E35231abE68818996dC07Be6a8889202DEe9';

module.exports = async function (deployer, network) {
  if (process.env.DEV) {
    fs.writeFileSync('deployed.json', '{}', { flag: 'w' }, function (err) {
      if (err) throw err;
    });
    let addrs = {};
    addrs = JSON.parse(fs.readFileSync('deployed.json').toString());
    let ton;
    await deployer.deploy(TON)
      .then((_ton) => {
        ton = _ton;
      });
    addrs.TON = ton.address;
    console.log(`ton.address: ${ton.address}`)
    console.log(`addrs: ${addrs}`)
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });
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
    addrs.WTON = wton.address;
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });

    addrs = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(Layer2Registry)
      .then((_registry) => {
        registry = _registry;
      });
    addrs.Layer2Registry = registry.address;
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });

    addrs = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(
      DepositManager,
      addrs.WTON,
      addrs.Layer2Registry,
      WITHDRAWAL_DELAY_RINKEBY,
    )
      .then((_depositManager) => {
        depositManager = _depositManager;
      });
    addrs.DepositManager = depositManager.address;
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });

    addrs = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(CoinageFactory)
      .then((_factory) => {
        factory = _factory;
      });
    addrs.Factory = factory.address;
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });

    addrs = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(DAOVault, addrs.WTON, 1609416000)
      .then((_daoVault) => {
        daoVault = _daoVault;
      });
    addrs.DaoVault = daoVault.address;
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });

    addrs = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(
      SeigManager,
      addrs.TON,
      addrs.WTON,
      addrs.Layer2Registry,
      addrs.DepositManager,
      _WTON(SEIG_PER_BLOCK).toFixed('ray'),
      addrs.Factory,
    )
      .then((_seigManager) => {
        seigManager = _seigManager;
      });
    addrs.SeigManager = seigManager.address;
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });

    addrs = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(
      PowerTON,
      addrs.SeigManager,
      addrs.WTON,
      ROUND_DURATION_RINKEBY,
    )
      .then((_powerton) => {
        powerton = _powerton;
      });
    addrs.PowerTON = powerton.address;
    fs.writeFileSync('deployed.json', JSON.stringify(addrs), (err) => {
      if (err) throw err;
    });

    console.log(JSON.stringify(addrs, null, 2));
  }
};
