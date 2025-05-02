# DAOVault

- 이 Contract는 DAO Contract에서 사용하는 자금이 모여있는 Vault Contract 입니다.


## functions

### setTON (address _ton)
TON 주소 설정
 - Parameters
   -  _ton (address) : TON 주소

---

### setWTON (address _wton)
WTON 주소 설정
 - Parameters
   -  _wton (address) : WTON 주소

---

### approveTON (address _to, uint256 _amount)
특정 주소에 대한 TON 승인
 - Parameters
   -  _to (address) : 승인할 주소
   -  _amount (uint256) : TON 금액 승인

---

### approveWTON (address _to, uint256 _amount)
특정 주소에 대한 WTON 승인
 - Parameters
   -  _to (address) : 승인할 주소
   -  _amount (uint256) : WTON 금액 승인

---

### approveERC20 (address _token, address _to, uint256 _amount)
특정 주소에 대한 ERC20 승인
 - Parameters
   -  _token (address) : ERC20 토큰 주소
   -  _to (address) : 승인할 주소
   -  _amount (uint256) : ERC20 토큰 금액 승인

---

### claimTON (address _to, uint256 _amount)
TON을 특정 주소로 전송합니다
 - Parameters
   -  _to (address) : 수신 주소
   -  _amount (uint256) : TON 금액 이체

---

### claimWTON (address _to, uint256 _amount)
WTON을 특정 주소로 전송합니다.
 - Parameters
   -  _to (address) : 수신 주소
   -  _amount (uint256) : WTON 금액 이체

---

### claimERC20 (address _token, address _to, uint256 _amount)
ERC20 토큰을 특정 주소로 전송합니다.
 - Parameters
   -  _token (address) : 토큰 주소
   -  _to (address) : 수신 주소
   -  _amount (uint256) : ERC20 토큰 금액 이체

---