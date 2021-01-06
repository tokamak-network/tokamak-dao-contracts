const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const CandidateFactory = artifacts.require('CandidateFactory');

module.exports = async function (deployer, network) {
  if (process.env.DEPLOY_CANDIDATE_FACTORY) {
    let candidateFactory;
    await deployer.deploy(
      CandidateFactory
    ).then((_candidateFactory) => {
      candidateFactory = _candidateFactory
    });

    save(
      network, {
        name: "CandidateFactory",
        address: candidateFactory.address
      }
    );

  }
};
