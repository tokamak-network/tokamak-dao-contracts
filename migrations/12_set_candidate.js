const load = require('../utils/load_deployed');

const DAOCommitteeProxy = artifacts.require('DAOCommittee');

module.exports = async function (deployer, network) {
  const committeeProxyAddress = '0xDD9f0cCc044B0781289Ee318e5971b0139602C26'
  // const committeeAddress = load(network, "DAOCommittee");
  const committeeProxy = await DAOCommitteeProxy.at(committeeProxyAddress);

  if (process.env.DEPLOY_CANDIDATE) {
    console.log('deploy candidate');
    await committeeProxy.createCandidate(process.env.CANDIDATE_NAME);
    console.log('done');
  }
  if (process.env.REGISTER_LAYER2) {
    console.log('register layer2');
    await committeeProxy.registerLayer2Candidate(process.env.LAYER2, process.env.CANDIDATE_NAME)
    console.log('done');
  }
};