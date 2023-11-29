require("dotenv").config();
const path = require("path");
// const HDWalletProvider = require("@truffle/hdwallet-provider");
const PrivateKeyProvider = require("truffle-privatekey-provider");
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  contracts_build_directory: path.join(__dirname, "build/contracts"),
  plugins: ['truffle-plugin-verify', 'truffle-plugin-stdjsonin'],
  api_keys: {
    etherscan: "MY_API_KEY",
  },
  networks: {
    development: {
      host: "localhost",
      port: 8546,
      gas: 6721975,
      network_id: "*", // eslint-disable-line camelcase,
    },
    rootchain: {
      host: "localhost",
      port: 8546,
      gas: 7500000,
      gasPrice: 1e9,
      network_id: "*", // eslint-disable-line camelcase
      websocket: true,
    },
    plasma: {
      host: "localhost",
      port: 8547,
      gas: 7500000,
      gasPrice: 1e9,
      network_id: "*", // eslint-disable-line camelcase
    },
    faraday: {
      provider: () =>
        new HDWalletProvider(
          [process.env.FARADAY_PRIVATE_KEY],
          process.env.FARADAY_PROVIDER_URL
        ),
      network_id: 16, // eslint-disable-line camelcase
      production: true,
    },
    rinkeby: {
      provider: () =>
        new PrivateKeyProvider(
          process.env.RINKEBY_PRIVATE_KEY,
          process.env.RINKEBY_PROVIDER_URL
        ),
      network_id: 4, // eslint-disable-line camelcase
      gasPrice: 5e9,
      skipDryRun: true,
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          [process.env.ROPSTEN_PRIVATE_KEY],
          process.env.ROPSTEN_PROVIDER_URL
        ),
      network_id: 3, // eslint-disable-line camelcase
      gasPrice: 100e9,
      production: true,
      skipDryRun: true,
    },
    mainnet: {
      provider: () =>
        new PrivateKeyProvider(
          process.env.MAINNET_PRIVATE_KEY,
          process.env.MAINNET_PROVIDER_URL
        ),
      network_id: 1, // eslint-disable-line camelcase
      gasPrice: 100e9,
      skipDryRun: true,
    },
    holesky: {
      provider: () =>
        new HDWalletProvider(
          process.env.MAINNET_PRIVATE_KEY,
          process.env.MAINNET_PROVIDER_URL
        ),
      network_id: 17000, // eslint-disable-line camelcase
      gasPrice: 100e9,
      skipDryRun: true,
      verify: {
        apiUrl: "https://api-holesky.etherscan.io/api",
        apiKey: "YY46TZ8HN26I7RKV3PKH1YE6Y9CJN7VMMS",
        explorerUrl: "https://holesky.etherscan.io/",
      },
    },

    //   ropsten: {
    //     provider: ropstenProvider,
    //     network_id: 3, // eslint-disable-line camelcase
    //   },
    //   coverage: {
    //     host: 'localhost',
    //     network_id: '*', // eslint-disable-line camelcase
    //     port: 8555,
    //     gas: 0xfffffffffff,
    //     gasPrice: 0x01,
    //   },
    //   ganache: {
    //     host: 'localhost',
    //     port: 8545,
    //     network_id: '*', // eslint-disable-line camelcase
    //   },
  },
  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: 21,
    },
    useColors: true,
    before_timeout: 520000,
    enableTimeouts: false,
    bail: true,
    // Here is 2min but can be whatever timeout is suitable for you.
  },
  compilers: {
    solc: {
      version: "0.7.6",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
