const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const { toBN } = require('web3-utils');

const TON = artifacts.require('TON');

module.exports = async function (deployer, network) {
  if (process.env.MINT) {
    const tonAddress = load(network, "TON");
    const ton = await TON.at(tonAddress);

    const amount = toBN("10000000000000000000000000");
    await ton.mint("0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39", amount);
    await ton.mint("0x6704Fbfcd5Ef766B287262fA2281C105d57246a6", amount);
    await ton.mint("0x9E1Ef1eC212F5DFfB41d35d9E5c14054F26c6560", amount);
    await ton.mint("0xce42bdB34189a93c55De250E011c68FaeE374Dd3", amount);
    await ton.mint("0x97A3FC5Ee46852C1Cf92A97B7BaD42F2622267cC", amount);
    await ton.mint("0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7", amount);
    await ton.mint("0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD", amount);
    await ton.mint("0xe84Da28128a48Dd5585d1aBB1ba67276FdD70776", amount);
    await ton.mint("0xCc036143C68A7A9a41558Eae739B428eCDe5EF66", amount);
    await ton.mint("0xE2b3204F29Ab45d5fd074Ff02aDE098FbC381D42", amount);
    await ton.mint("0x5b6e72248b19F2c5b88A4511A6994AD101d0c287", amount);
    await ton.mint("0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9", amount);
    await ton.mint("0xE68c794871c7a43369CAB813A25F9C42f8195aC4", amount);
    await ton.mint("0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E", amount);
    await ton.mint("0x1138447a8f8F2c6078918C36A6366c9d12d8d234", amount);

    await ton.mint("0x040b798028e9abded00Bfc65e7CF01484013db17", amount);
    await ton.mint("0x396e6fdcCcff2903f1ec095662FE496492E473a8", amount);
    await ton.mint("0x8B18A408FfEB025Bf89bA4A4cEB509997B179C16", amount);
    await ton.mint("0x2Ae0b32Dd2a99d3799F93b6040CE0AFB45BD3745", amount);
    await ton.mint("0xD0805311294884133C5f715eD26f304611c81a7E", amount);
    await ton.mint("0x4068Bb8793A540F1Bfe6cC073829D4b2de57292a", amount);
    await ton.mint("0xE6EC9B5Ad87B52bb33EFdce0F10bd38750B70c3a", amount);
    await ton.mint("0x0A234A3c170a017128E2cB460E520341E874e04F", amount);
    await ton.mint("0x42da548d077E743eeF6A9aaF0E34fcC03a71F3a8", amount);
    await ton.mint("0xba7c826f853DeAa0A7D0d9Da50AD4F27CA02d5AB", amount);
    await ton.mint("0x2Ef8b63d574b6ca271E6C92C60A0317D8E6183f2", amount);
    await ton.mint("0x5941Dd2B2d08f8F7D85DDD8a69e46ef9559E900A", amount);
    await ton.mint("0x1B2E935F1A5906A65C89162ceBB911Da92021DB9", amount);
    await ton.mint("0x2734De8998da786dcA120eBEC1d524E6980342f6", amount);
    await ton.mint("0x99fDF51541bed247404bf3Ce85e35Ec760F2d9B2", amount);
  }
};
