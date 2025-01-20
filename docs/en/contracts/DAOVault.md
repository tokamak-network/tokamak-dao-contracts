# DAOVault

- This Contract is a Vault Contract that gathers the funds used by the DAO Contract.

## functions

### setTON (address _ton)
Set TON address
 - Parameters
   -  _ton (address) : TON address

---

### setWTON (address _wton)
Set WTON address
 - Parameters
   -  _wton (address) : WTON address

---

### approveTON (address _to, uint256 _amount)
Approves TON to specific address
 - Parameters
   -  _to (address) : Address to be approved
   -  _amount (uint256) : Approving TON amount

---

### approveWTON (address _to, uint256 _amount)
Approves WTON to specific address
 - Parameters
   -  _to (address) : Address to be approved
   -  _amount (uint256) : Approving WTON amount

---

### approveERC20 (address _token, address _to, uint256 _amount)
Approves ERC20 token to specific address
 - Parameters
   -  _token (address) : Token address
   -  _to (address) : Address to be approved
   -  _amount (uint256) : Approving ERC20 token amount

---

### claimTON (address _to, uint256 _amount)
Transfers TON to specific address
 - Parameters
   -  _to (address) : Address to receive
   -  _amount (uint256) : Transfer TON amount

---

### claimWTON (address _to, uint256 _amount)
Transfers WTON to specific address
 - Parameters
   -  _to (address) : Address to receive
   -  _amount (uint256) : Transfer WTON amount

---

### claimERC20 (address _token, address _to, uint256 _amount)
Transfers ERC20 token to specific address
 - Parameters
   -  _token (address) : Token address
   -  _to (address) : Address to receive
   -  _amount (uint256) : Transfer ERC20 token amount

---