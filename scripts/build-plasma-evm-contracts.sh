#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=$SCRIPT_DIR"/../"
PLASMA_EVM_CONTRACTS_DIR=$ROOT_DIR"plasma-evm-contracts/"
echo $ROOT_DIR

cd $PLASMA_EVM_CONTRACTS_DIR

git submodule init
git submodule update

cd requestable-erc20-wrapper-token
git submodule init
git submodule update
cd -

npm install
truffle compile

echo $PLASMA_EVM_CONTRACTS_DIR"build/contracts/*"
echo $ROOT_DIR"build/contracts/"

cp $PLASMA_EVM_CONTRACTS_DIR"build/contracts"/* $ROOT_DIR"build/contracts/"

cd -
