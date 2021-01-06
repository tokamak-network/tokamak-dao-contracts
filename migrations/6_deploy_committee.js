const save = require('../utils/save_deployed');
const load = require('../utils/load_deployed');

const DAOCommittee = artifacts.require('DAOCommittee');

module.exports = async function (deployer, network) {
  if (process.env.DEPLOY_COMMITTEE) {
    let committee;
    await deployer.deploy(
      DAOCommittee
    ).then((_committee) => {
      committee = _committee
    });

    save(
      network, {
        name: "DAOCommittee",
        address: committee.address
      }
    );

  }
};
