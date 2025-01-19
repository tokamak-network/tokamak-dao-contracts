# CandidateFactory

- 이 Contract는 DAOContract에서 Candidate를 생성될 때 사용하는 Contract 입니다.


## functions

### deploy (address _sender, bool _isLayer2Candidate, string _name, address _committee, address _seigManager)
Candidate Contract를 Deploy 합니다.
 - Parameters
   -  _sender (address) : deploy function을 호출한 sender주소
   - _isLayer2Candidate (bool) : Layer2Candidate이면 true, 아니면 flase
   - _name (string) : Candidate의 이름
   - _committee (address) : Candidate가 사용할 DAOContract의 주소 
   - _seigManager (address) : Candidate가 사용할 SeigManagerContract의 주소
 - Result
   - (address) : Candidate Contract의 주소를 리턴합니다.

---