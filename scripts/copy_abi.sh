#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=$SCRIPT_DIR"/../"
BUILD_DIR=$ROOT_DIR"/build/contracts/"
ABI_DIR=$ROOT_DIR"/abi/"

cp $BUILD_DIR"AutoRefactorCoinage.json" $ABI_DIR
cp $BUILD_DIR"Candidate.json" $ABI_DIR
cp $BUILD_DIR"CandidateFactory.json" $ABI_DIR
cp $BUILD_DIR"DAOAgendaManager.json" $ABI_DIR
cp $BUILD_DIR"DAOCommittee.json" $ABI_DIR
cp $BUILD_DIR"DAOCommitteeProxy.json" $ABI_DIR
cp $BUILD_DIR"DAOVault2.json" $ABI_DIR
cp $BUILD_DIR"DepositManager.json" $ABI_DIR
cp $BUILD_DIR"Layer2.json" $ABI_DIR
cp $BUILD_DIR"Layer2Registry.json" $ABI_DIR
