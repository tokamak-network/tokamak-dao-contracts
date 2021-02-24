export RINKEBY_PROVIDER_URL=$1
export RINKEBY_PRIVATE_KEY=$2
export DEPLOY_COMMITTEE_PROXY=true

truffle migrate --network rinkeby 