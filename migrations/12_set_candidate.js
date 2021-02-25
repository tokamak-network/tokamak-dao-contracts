const load = require('../utils/load_deployed');

const DAOCommitteeProxy = artifacts.require('DAOCommittee');

module.exports = async function (deployer, network) {
  const committeeProxyAddress = '0xEcd5E344d0649FF76AdBC10f5e3C0c100479559D'
  // const committeeAddress = load(network, "DAOCommittee");
  const committeeProxy = await DAOCommitteeProxy.at(committeeProxyAddress);

  if (process.env.DEPLOY_CANDIDATE) {
    console.log('deploy candidate');
    await committeeProxy.createCandidate(process.env.CANDIDATE_NAME);
    console.log('done');
  }
  if (process.env.REGISTER_LAYER2) {
    console.log('register layer2');
    committeeProxy.registerLayer2Candidate(process.env.LAYER2, process.env.CANDIDATE_NAME)
    console.log('done');
  }
};