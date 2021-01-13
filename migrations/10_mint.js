const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const { toBN } = require('web3-utils');

const TON = artifacts.require('TON');

module.exports = async function (deployer, network) {
  if (process.env.MINT) {
    const tonAddress = load(network, "TON");
    const ton = await TON.at(tonAddress);

    const address = "0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39";
    const amount = toBN("10000000000000000000000000");
    await ton.mint(address, amount);
    await ton.mint("0x6704Fbfcd5Ef766B287262fA2281C105d57246a6", amount);
    await ton.mint("0x9E1Ef1eC212F5DFfB41d35d9E5c14054F26c6560", amount);
    await ton.mint("0xce42bdB34189a93c55De250E011c68FaeE374Dd3", amount);
    await ton.mint("0x97A3FC5Ee46852C1Cf92A97B7BaD42F2622267cC", amount);
    await ton.mint("0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7", amount);
    await ton.mint("0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD", amount);
    await ton.mint("0xe84Da28128a48Dd5585d1aBB1ba67276FdD70776", amount);
    await ton.mint("0xCc036143C68A7A9a41558Eae739B428eCDe5EF66", amount);
    await ton.mint("0xE2b3204F29Ab45d5fd074Ff02aDE098FbC381D42", amount);
  }
};
