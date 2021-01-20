import os
import json

BUILD_DIR = "build/contracts/"
OUTPUT_DIR = "functions/"
abi_files = [
    "TON.json",
    "WTON.json",
    "DepositManager.json",
    "SeigManager.json",
    "Layer2Registry.json",
    "DAOVault.json",
    "Candidate.json",
    "DAOAgendaManager.json",
    "DAOCommittee.json",
    "DAOCommitteeProxy.json",
    "DAOVault2.json"
]

def isCallableFunc(data):
    print(data)
    return data["type"] == "function" and data["stateMutability"] != "view"

for abi_file in abi_files:
    with open(BUILD_DIR + abi_file, "r") as f:
        file_data = json.load(f)
        result = [x["name"] + "(" + ",".join([i["type"] for i in x["inputs"]]) + ")" for x in file_data["abi"] if isCallableFunc(x)]
        print("#"*80)
        print("#"*10, abi_file)
        print(result)
        with open(OUTPUT_DIR + abi_file + ".func", "w") as output:
            output.write("\n".join(result))
