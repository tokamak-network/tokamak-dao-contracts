#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=$SCRIPT_DIR"/../"
PLASMA_EVM_CONTRACTS_DIR=$ROOT_DIR"plasma-evm-contracts/"

cd $PLASMA_EVM_CONTRACTS_DIR

git submodule init
git submodule update

cd requestable-erc20-wrapper-token
git submodule init
git submodule update
cd -

npm install
truffle compile

cp $PLASMA_EVM_CONTRACTS_DIR"build/contracts"/* $ROOT_DIR"build/contracts/"

cd -
