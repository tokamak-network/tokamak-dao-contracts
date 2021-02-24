export RINKEBY_PROVIDER_URL=$1
export RINKEBY_PRIVATE_KEY=$2
export DEPLOY_AGENDA_MANAGER=true

truffle migrate --network rinkeby 