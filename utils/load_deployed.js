const fs = require('fs')

module.exports = function (network, name) {
  const data = JSON.parse(fs.readFileSync(`deployed.${network}.json`).toString());
  return data[name];
}
