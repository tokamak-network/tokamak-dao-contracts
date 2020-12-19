// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/Ownabled.sol";
import "./StorageStateCommittee.sol"; 

import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";  

contract DAOCommittee is StorageStateCommittee , Ownabled { 
    using SafeMath for uint256; 
     
    //////////////////////////////
    // Events
    ////////////////////////////// 
    event AgendaCreated(address indexed from, uint256 indexed id, uint indexed group, address target, uint[5] times ,bytes functionBytecode,string description); 
    event AgendaVoteCasted( address indexed from, uint256 indexed id, uint voting , string comment, uint256[3] counting, uint result); 
    event AgendaExecuted(  address indexed from, uint256 indexed id, address target, bytes functionBytecode, uint status, uint[5] times);
    event AgendaElectCommittee( address indexed from, uint256 indexed id, uint status, uint[5] times );
    
    
    enum  ApplyResult { NONE, SUCCESS, NOT_ELECTION, ALREADY_COMMITTEE, SLOT_INVALID, ADDMEMBER_FAIL, LOW_BALANCE }
     
    function setStore(address _store)  public onlyOwner {
        require( _store != address(0)); 
        store = DAOCommitteeStore(_store); 
    } 

    function setDaoElection(address _daoElection)   public  onlyOwner {  store.setDaoElection(_daoElection); }
    function setDaoVault(address _daoVault)  public  onlyOwner {  store.setDaoVault(_daoVault); } 
    function setAgendamanager(address _manager)  public onlyOwner validStore { 
        require( _manager != address(0)); 
        store.setAgendaManager(_manager);   
        agendaManager = DAOAgendaManager(_manager); 
    } 
    function setActivityfeemanager(address _manager)  public onlyOwner validStore { 
        require( _manager != address(0)); 
        store.setActivityFeeManager(_manager);   
        activityfeeManager = DAOActivityFeeManager(_manager); 
    } 
    function setMaxCommittees(uint256 _maxCommittees) public onlyOwner  {  store.setMaxCommittees(_maxCommittees); }  
    function popCommitteeSlot() public onlyOwner  {  store.popCommitteeSlot();}

    //--dao election
    function applyCommittee( uint256 _indexSlot, address _layer2, address _operator, string memory _name , uint256 totalbalance ) 
        public returns (uint applyResultCode , uint256 _memberindex) { 
        
        require( _layer2!=address(0) && _operator!=address(0),' operator can not zero address' );
        
        address elect = store.getDaoElection();  
        if(elect != msg.sender ){ return (uint(ApplyResult.NOT_ELECTION), 0);  } 
        (bool _iscommittee, ) = store.isCommittee(_operator) ;
         
        if( _iscommittee ) {  return (uint(ApplyResult.ALREADY_COMMITTEE), 0);  }   
        if( _indexSlot >= store.lengthCommitteeSlotIndex() ) {  return (uint(ApplyResult.SLOT_INVALID), 0 );  }   
        
        _memberindex = store.addMember( _layer2, _operator, _name) ; 
        
        if( _memberindex < 1 ) {  return (uint(ApplyResult.ADDMEMBER_FAIL), 0);  }    
       
        // compare prev committee's balance 
        ( , , , , , uint256 balance,,) = store.detailedCommittee(_indexSlot) ;
        
        if( balance > totalbalance ) { return (uint(ApplyResult.LOW_BALANCE) , _memberindex); }
         
        require( store.changeCommittee(_indexSlot, _memberindex, _operator, totalbalance) );
        
        return (uint(ApplyResult.SUCCESS), _memberindex); 
    } 
    
    function retireCommittee() public returns (bool){  
        (bool _iscommittee, ) = store.isCommittee(msg.sender) ;
        require(_iscommittee,'you are not commiittee');
        return store.retireCommittee(msg.sender) ; 
    } 
    
     // ----- agendaManager 
    function setMinimunNoticePeriodMin(uint256 _minimunNoticePeriod)  public onlyOwner validAgendaManager { agendaManager.setMinimunNoticePeriodMin(_minimunNoticePeriod); }
    function setMinimunVotingPeriodMin(uint256 _minimunVotingPeriod)  public  onlyOwner validAgendaManager { agendaManager.setMinimunVotingPeriodMin(_minimunVotingPeriod); }
    function setQuorum(uint256 quorumNumerator, uint256 quorumDenominator)   public onlyOwner validAgendaManager  {  agendaManager.setQuorum(quorumNumerator,quorumDenominator); }
    function setCreateAgendaFees(uint256 _fees)  public onlyOwner validAgendaManager {  agendaManager.setCreateAgendaFees(_fees); } 
   
    function createAgenda( uint _group, address _target, uint _noticePeriodMin,bytes memory functionBytecode,string memory _description ) 
        public  validStore validAgendaManager validActivityfeeManager returns (uint256) {
         
        require( _noticePeriodMin >= agendaManager.getMinimunNoticePeriodMin(), "The notice period is short"); 
        address tonaddress = store.getTON();
        require( tonaddress != address(0) ); 
        
        // pay to create agenda, burn ton. 
        uint256 createAgendaFees = agendaManager.getCreateAgendaFees(); 
            
        if( createAgendaFees > 0 ){  
            require( IERC20(store.getTON()).balanceOf(msg.sender) >= createAgendaFees , 'not enough ton balance');
            require( IERC20(store.getTON()).allowance(msg.sender,address(this)) >= createAgendaFees, 'token allowance is lack');  
            // ton did not have burn function. we transfer createAgendaFees to  address(1) . 
            // (bool success, ) = address(store.getTON()).call(abi.encodeWithSignature("burnFrom(address,uint256)",msg.sender,createAgendaFees));
            // require(success,'CreateAgendaFees-burn failed'); 
            (bool success, ) = address(store.getTON()).call(abi.encodeWithSignature("transferFrom(address,address,uint256)",msg.sender,address(1),createAgendaFees));
            require(success,'CreateAgendaFees-burn failed');  
        } 
         
        uint256 _fees = activityfeeManager.calculateActivityFees() ;
        (uint256 agendaID , , , uint[5] memory _times ) = agendaManager.newAgenda( _group, _target, msg.sender, _noticePeriodMin ,functionBytecode, _description, _fees ) ;
          
        emit AgendaCreated(msg.sender, agendaID, _group, _target, _times, functionBytecode, _description);
        return agendaID; 
    } 
    
    function electCommiitteeForAgenda(uint256 _AgendaID) public validStore validAgendaManager  {
        
        require( _AgendaID < agendaManager.totalAgendas(),  "Not a valid Agenda Id" );
        (address[2] memory _address, uint[8] memory datas,  , , bool executed, bytes memory functionBytecode, ,  ) = agendaManager.detailedAgenda(_AgendaID);
         
        address _target = _address[1];
        require(_target!=address(0) && !executed ,'check target - fail or already executed'  ); 
        require(!checkRisk(_target, functionBytecode),'can be risk');
        
        //// times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
        //uint[8] memory args1 = [ uint(agenda.status) ,uint(agenda.result) , uint(agenda.group) , agenda.times[0],
        // 4: noticeEndTime , 5:votingStartTime , 6:votingEndTime , 7:execTime ];
        
        require( datas[0] == uint(AgendaStatus.NOTICE) && datas[1]==uint(AgendaResult.UNDEFINED) ,'Unsuitable status or result' );
        require( datas[4] < now  ,'noticeEndTime is not ended' );
        require( datas[5]==0 &&  datas[6]==0 && datas[7]==0 ,'It is not committee election period.' );
         
         (bool result ,uint status, uint[5] memory times ) = agendaManager.electCommiitteeForAgenda(_AgendaID, store.getCommittees());
 
        require( result ,' electCommiitteeForAgenda fails') ;  
        emit AgendaElectCommittee( msg.sender, _AgendaID, status, times );
    } 
    
    function checkRisk( address _target, bytes memory _functionBytecode)  public pure returns (bool){
        require(_target!=address(0)  ,'check target'  );
        require(_functionBytecode.length > 0 ,'check functionBytecode'  ); 
        return false; 
    }

    /**
    * @dev casts a vote.
    * @param _AgendaID the agenda id 
    * @param _vote  0 for abstain, 1 for yes, 2 for no
    */
    function castVote(uint256 _AgendaID, uint _vote, string calldata _comment) external validStore validAgendaManager
    { 
        uint256 _majority = getMajority();
        require( _majority > 0 ,'majority is zero');
        
        require(_vote <= uint(VoteChoice.NO) );  
        
        //(bool _iscommittee, uint256 _committeeIndex ) = store.isCommittee(msg.sender) ;
        //_committeeIndex 
        (uint256 _committeeId, address _layer2, , , , ) = store.detailedMember(msg.sender) ;
        
        require(_committeeId > 0 , "you are not a committee member."); 
        (bool exist, uint status) =  agendaManager.getAgendaStatus(_AgendaID); 
        require( exist && status == uint(AgendaStatus.VOTING),"agenda has expired." ); 
        require( !agendaManager.userHasVoted(_AgendaID, msg.sender), "user already voted on this agenda" );
        require( agendaManager.getAgendaVotingStartTimeSeconds(_AgendaID) <= now && now <=agendaManager.getAgendaVotingEndTimeSeconds(_AgendaID) , "for this agenda, the voting time expired" );
        require( agendaManager.validCommitteeForAgenda(_AgendaID, msg.sender ),"you are not a committee member on this agenda."); 
        
        (uint256[3] memory counting, uint result) = agendaManager.castVote(_AgendaID, msg.sender, _layer2, _vote, _comment, _majority);
        store.castVote( msg.sender); 
        
        emit AgendaVoteCasted( msg.sender, _AgendaID, _vote , _comment, counting, result ); 
    } 

     
    function executeAgenda(uint256 _AgendaID) public validStore validAgendaManager {
       
        //require( store.validMember(msg.sender), "you are not a committee member."); 
        //(bool exist ,  ) = agendaManager.getAgendaStatus(_AgendaID);
        
        //uint[8] memory datas = [ uint(agenda.status) ,uint(agenda.result) , uint(agenda.group) , 
        //3:creationDate, 4: noticeEndTime, 5:votingStartTime, 6:votingEndTime , 7: execTime ];
         
             
        ( address[2] memory creator, uint[8] memory datas, ,  , bool executed, ,, )  = agendaManager.detailedAgenda(_AgendaID) ;
        require( creator[0]!=address(0) && datas[0] == uint(AgendaStatus.VOTING) ,"agenda status must be VOTING." );   
        require( datas[6] < now , "for this agenda, the voting time is not expired" );
        require( datas[1] == uint(AgendaResult.ACCEPT) , "for this agenda, not accept" );
        require( executed == false , "for this agenda, already executed" );
        
        (bool agendaupdate, uint status, uint result, bool exec, address target, bytes memory functionBytecode, uint[5] memory times) = agendaManager.setExecuteAgenda(_AgendaID) ;
       
        require( agendaupdate && result == uint(AgendaResult.ACCEPT) && exec && target!=address(0) ,'fail setExecuteAgenda');
         
        (bool success, ) = address(target).call(functionBytecode); 
        require(success,'execute function fail');  
         
        emit AgendaExecuted( msg.sender, _AgendaID, target, functionBytecode , status, times); 
    }   
    
    /* 
    function detailedAgenda(uint256 _AgendaID) 
        public  view validAgendaManager  returns (address[2] memory users, uint[8] memory datas, uint256[3] memory counting, uint256 fees, bool executed, bytes memory functionBytecode,string memory description,  address[] memory voters) {
       return agendaManager.detailedAgenda(_AgendaID) ;
    } 
    
    // public 
    function detailedAgendaVoteInfo(uint256 _AgendaID) 
        public  view validAgendaManager returns (bool hasVoted , uint256 vote, string memory comment ) {
        return agendaManager.detailedAgendaVoteInfo(_AgendaID, msg.sender) ;
    } 
     
    function totalAgendas() public view validAgendaManager returns (uint256) {   return agendaManager.totalAgendas() ; }
    function getNumExecAgendas() public view validAgendaManager returns (uint256) { 
        return agendaManager.getNumExecAgendas() ;
    } 
     */
    function getMajority() public view validAgendaManager returns (uint256 majority) {
        (uint256 ratioNum, uint256 ratioDeno ) = agendaManager.getQuorumRatio();
        require( ratioNum > 0 && ratioDeno > 0  && ratioDeno > ratioNum , "Not a valid quorum"  );
        uint256 totalcommittees = store.totalCommittees();
         
        uint256  total = totalcommittees.mul(ratioNum);
        majority =  total.div(ratioDeno) ;
        
       // if( total % ratioDeno > 0 ) majority =  majority.add(1) ;
    }
    
    function getTON() public view returns (address) {
        return store.getTON();
    }
     
}
