export MAINNET_PROVIDER_URL=$1
export MAINNET_PRIVATE_KEY=$2

if [ "$3" == "plasma" ]
then
  export DEPLOY_PLASMA_EVM=true

elif [ "$3" == "vault" ]
then
  export DEPLOY_VAULT=true

elif [ "$3" == "agenda" -a $# -eq 3 ]
then
  export DEPLOY_AGENDA_MANAGER=true

elif [ "$3" == "candidate-factory" -a $# -eq 3 ]
then
  export DEPLOY_CANDIDATE_FACTORY=true

elif [ "$3" == "committee" -a $# -eq 3 ]
then
  export DEPLOY_COMMITTEE=true

elif [ "$3" == "committee-proxy" -a $# -eq 3 ]
then
  export DEPLOY_COMMITTEE_PROXY=true

elif [ "$3" == "set-dao" -a $# -eq 3 ]
then
  export SET_DAO=true
fi

truffle migrate --network rinkeby 