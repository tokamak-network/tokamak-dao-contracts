# tokamak-dao-contracts

This repository contains the DAO contracts of Tokamak Network. Tokamak Network DAO supports all functionality in Tokamak Network contracts. All functions of all contracts are executed only by the DAO. And Tokamak Network foundation doesn't own any contracts(except dao itself. It will be renounced later).

# How it works

* Agendas: Anyone can create an agenda. An agenda has one or more function executions.
* Members: Members can vote on agendas. And they get rewards based on activity period.
* Candidates: Anyone can be a candidate. The amount of votes a candidate gets is deposited TON amount on the candidate.
* Users: Users can deposit on candidates and get seigniorage.

# Build

```
$ npm install
$ npm run compile:plasma
$ truffle compile
```

# Test

```
$ npm test
```
