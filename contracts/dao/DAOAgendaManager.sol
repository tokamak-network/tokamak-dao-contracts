// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/OwnableAdmin.sol"; 

import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import { DAOAgendaManagerRole } from "../roles/DAOAgendaManagerRole.sol"; 

contract DAOAgendaManager is OwnableAdmin, DAOAgendaManagerRole { 
     
    using SafeMath for uint256; 
    address public ton ;  
    address public activityFeeManager ;  
    
    uint256 public numAgendas;
    uint256 public numExecAgendas; 
    
    uint256 public createAgendaFees; // 아젠다생성비용  
    
    uint256 public minimunNoticePeriodMin;
    uint256 public minimunVotingPeriodMin; 
    
    Agenda[] public agendas;  
    
    Ratio public quorum;
    
    struct Ratio {
        uint256 numerator;
        uint256 denominator;
    } 
    
    // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
    // counting abstainVotes yesVotes noVotes
    struct Agenda {
        address creator;
        AgendaStatus status;
        AgendaResult result;
        uint group;
        bool executed;
        uint[5] times; 
        uint256[3] counting;
        uint256 fees;
        address target;
        bytes functionBytecode;
        string description;
        address[] voters;  
        mapping(address => Voter) voterInfo;
        address[] committees;
    }
    
    //votor : based operator 
    struct Voter {
        bool hasVoted;
        address layer2;
        uint vote;
        string comment;
    } 
     
    enum VoteChoice { ABSTAIN, YES, NO }
    enum AgendaStatus { NONE, NOTICE, VOTING, EXEC, ENDED, PENDING, RISK }
    enum AgendaResult { UNDEFINED, ACCEPT, REJECT, DISMISS }
     
    
    constructor(address _ton) public { 
        minimunNoticePeriodMin = 60*24*15; //  15 days , with minutes 
        minimunVotingPeriodMin = 60*24*2; //  2 days , with minutes 
        
        createAgendaFees = 0; 
        quorum = Ratio(1,2);
        ton = _ton;
        numAgendas =0; 
    } 
    function getStatus(uint _status) public view returns (AgendaStatus emnustatus) {
        if(_status == uint(AgendaStatus.NOTICE) ) return  AgendaStatus.NOTICE;
        else if(_status == uint(AgendaStatus.VOTING) ) return  AgendaStatus.VOTING;
        else if(_status == uint(AgendaStatus.EXEC) ) return  AgendaStatus.EXEC;
        else if(_status == uint(AgendaStatus.ENDED) ) return  AgendaStatus.ENDED;
        else if(_status == uint(AgendaStatus.PENDING) ) return  AgendaStatus.PENDING;
        else if(_status == uint(AgendaStatus.RISK) ) return  AgendaStatus.RISK;
        else return AgendaStatus.NONE;
    } 
    function setStatus(uint256 _AgendaID, uint _status)  onlyOwner public { 
        require( _AgendaID < numAgendas,  "Not a valid Proposal Id" );
        agendas[_AgendaID].status = getStatus(_status);
    }
    function setCreateAgendaFees(uint256 _createAgendaFees)  onlyOwner public { 
        createAgendaFees = _createAgendaFees;
    }
    function setMinimunNoticePeriodMin(uint256 _minimunNoticePeriodMin)  onlyOwner public { 
        minimunNoticePeriodMin = _minimunNoticePeriodMin;
    }
    function setMinimunVotingPeriodMin(uint256 _minimunVotingPeriodMin)  onlyOwner public { 
        minimunVotingPeriodMin = _minimunVotingPeriodMin;
    } 
      
    function setActivityFeeManager(address _man)  onlyOwner public {
        require(_man != address(0)); 
        activityFeeManager = _man;
    }   
    function setQuorum(uint256 quorumNumerator, uint256 quorumDenominator)  onlyOwner public {
        require( quorumNumerator > 0 && quorumDenominator > 0 &&  quorumNumerator < quorumDenominator ); 
        quorum = Ratio(quorumNumerator,quorumDenominator);
    }  
    
    function userHasVoted(uint256 _AgendaID, address _user) public view  returns (bool)
    {
        require( _AgendaID < numAgendas,  "Not a valid Proposal Id" );
        return (agendas[_AgendaID].voterInfo[_user].hasVoted);
    }
    
    function getQuorumRatio() public view  returns (uint256 numerator, uint256 denominator ) { 
        return (quorum.numerator , quorum.denominator);
    }
     
    function getAgendaNoticeEndTimeSeconds(uint256 _AgendaID) public view  returns (uint)
    {
         // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
        require( _AgendaID < numAgendas,  "Not a valid Agenda Id" ); 
        return ( agendas[_AgendaID].times[1] );
    } 
    
    function getAgendaVotingStartTimeSeconds(uint256 _AgendaID) public view  returns (uint)
    {
         // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
        require( _AgendaID < numAgendas,  "Not a valid Agenda Id" ); 
        return ( agendas[_AgendaID].times[2] );
    }
    function getAgendaVotingEndTimeSeconds(uint256 _AgendaID) public view  returns (uint)
    {
         // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
        require( _AgendaID < numAgendas,  "Not a valid Agenda Id" ); 
        return ( agendas[_AgendaID].times[3] );
    }
    
    function detailedAgenda(uint256 _AgendaID) 
        public view  returns (address[2] memory  creator, uint[8] memory datas, uint256[3] memory counting,uint256 fees, bool executed, bytes memory functionBytecode,string memory description,  address[] memory voters ) {
        //returns (address,uint[3] memory,uint[3] memory ,uint256[5] memory ,bool ,address[] memory ) {
        require( _AgendaID < numAgendas,  "Not a valid Agenda Id" );
        Agenda memory agenda = agendas[_AgendaID]; 
        uint[8] memory args1 = [ uint(agenda.status) ,uint(agenda.result) , uint(agenda.group) , agenda.times[0],agenda.times[1],agenda.times[2],agenda.times[3] ,agenda.times[4] ];
        
        return ( [agenda.creator, agenda.target], args1, agenda.counting,agenda.fees, agenda.executed , agenda.functionBytecode , agenda.description ,agenda.voters);
    }

    function detailedAgendaVoteInfo(uint256 _AgendaID, address voter) 
        public view returns (bool hasVoted , uint256 vote, string memory comment) {
            
        require( _AgendaID < numAgendas,  "Not a valid Agenda Id" );     

        if(agendas[_AgendaID].voterInfo[voter].hasVoted )  {
            return ( agendas[_AgendaID].voterInfo[voter].hasVoted , agendas[_AgendaID].voterInfo[voter].vote , agendas[_AgendaID].voterInfo[voter].comment );  
        } else {
            return (false, 0, '' );  
        } 
    } 
    
    function getAgendaStatus(uint256 _AgendaID) public view returns (bool exist, uint status) {
         
        if(_AgendaID < agendas.length)
            return (true, uint(agendas[_AgendaID].status) ); 
        else 
            return (false, 0);
    }

    function totalAgendas() public view returns (uint256) { 
        return agendas.length;
    } 
    function getNumExecAgendas() public view returns (uint256) { 
        return numExecAgendas;
    } 
    
    function getCreateAgendaFees() public view returns (uint256) { return createAgendaFees;}
    function getMinimunNoticePeriodMin() public view returns (uint256) { return minimunNoticePeriodMin;}
    function getMinimunVotingPeriodMin() public view returns (uint256) { return minimunVotingPeriodMin;}
     
    function getActivityFeeManager() public view returns (address) { return activityFeeManager;}
    function getAgendaResult(uint256 _AgendaID) public view  returns (uint result,bool executed, address target, bytes memory functionBytecode){
        require( _AgendaID < numAgendas,  "Not a valid _AgendaID Id" );    
        return ( uint(agendas[_AgendaID].result), agendas[_AgendaID].executed, agendas[_AgendaID].target, agendas[_AgendaID].functionBytecode );
    }
   
    function newAgenda( uint _group, address _target, address _creator, uint _noticePeriodMin,bytes memory _functionBytecode,string memory _description, uint256 _fees ) 
        onlyOwner public returns (uint256 agendaID , uint status, uint result, uint[5] memory times ) {
        
        require(_noticePeriodMin >= minimunNoticePeriodMin ,'minimunNoticePeriod is short') ;
         
        Agenda memory p;
        p.creator = _creator;
        p.status = AgendaStatus.NOTICE;
        p.result = AgendaResult.UNDEFINED;
        p.executed = false;
        //times   0: creationDate  1: notice-endTime  2: voting-start 3: voting-end 4: execTime
        p.times[0] = now;
        p.times[1] = now + 60 * _noticePeriodMin * 1 seconds;
        p.times[2] = 0;
        p.times[3] = 0; 
        p.times[4] = 0;
        p.functionBytecode = _functionBytecode;
        p.description = _description;
        p.group = _group; 
        p.target = _target;  
        p.fees = _fees; 
        //p.proposalHash = keccak256(abi.encodePacked(functionBytecode, p.target)); 
        
        agendas.push(p);
        
        numAgendas = agendas.length; 
        agendaID = numAgendas.sub(1);
        return ( agendaID, uint(p.status) , uint(p.result), p.times ) ;
    }
    
    
    function electCommiitteeForAgenda(uint256 _AgendaID, address[] memory committees ) 
         public onlyOwner returns (bool result ,uint status, uint[5] memory times ) {
       
        require( _AgendaID < agendas.length && agendas[_AgendaID].status == AgendaStatus.NOTICE, "agenda has expired." );  
        Agenda storage curagenda = agendas[_AgendaID]; 
        
        uint256 i=0; 
        for(i=1; i< committees.length; i++){
            address _addr = committees[i];
            curagenda.committees.push(_addr); 
        }
        curagenda.times[2] = now;
        curagenda.times[3] = now + 60 * minimunVotingPeriodMin * 1 seconds;  
        curagenda.status = AgendaStatus.VOTING ;  
        return ( true, uint(curagenda.status), times );
    }
    
    function validCommitteeForAgenda(uint256 _AgendaID, address user) public view returns (bool) {
        require(user!=address(0));
        Agenda storage curagenda = agendas[_AgendaID]; 
        uint256 i=0; 
        for(i=0; i< curagenda.committees.length; i++){
             if(user == curagenda.committees[i]) return true;
        }
        return false; 
    }
    
    function castVote(uint256 _AgendaID,  address voter,address _layer, uint _vote , string memory _comment, uint256 _majority ) onlyOwner public  
    {  
        
        require( _AgendaID < agendas.length && agendas[_AgendaID].status == AgendaStatus.VOTING, "status is not voting." ); 
        /*
        require( agendas[_AgendaID].times[2] >= now  && agendas[_AgendaID].times[3] <= now , "voting period has expired." );
        require( validCommitteeForAgenda(  _AgendaID, voter ),"you are not a committee member on this agenda."); 
        require( !userHasVoted(_AgendaID, voter), "voter already voted on this proposal" );
        */
        
        Agenda storage curagenda = agendas[_AgendaID];
        
        curagenda.voterInfo[voter] = Voter({
            hasVoted: true, 
            layer2:_layer,
            vote: _vote, 
            comment: _comment
        });
             
        curagenda.voters.push(voter); 
        
        // counting 0:abstainVotes 1:yesVotes 2:noVotes 
        if(_vote == uint(VoteChoice.ABSTAIN) ) curagenda.counting[0] = curagenda.counting[0].add(1);
        else if(_vote == uint(VoteChoice.YES)) curagenda.counting[1] = curagenda.counting[1].add(1);
        else curagenda.counting[2] = curagenda.counting[2].add(1); 
        
        if( _majority < curagenda.counting[0] ){  curagenda.result = AgendaResult.DISMISS; }
        else if(_majority < curagenda.counting[1] ) { curagenda.result = AgendaResult.ACCEPT; }
        else if(_majority < curagenda.counting[2] ) { curagenda.result = AgendaResult.REJECT; } 
          
    }  
    
    
    function setExecuteAgenda(uint256 _AgendaID) onlyOwner public returns ( bool success,  uint result, bool executed, address target, bytes memory functionBytecode)  
    {   
        require( _AgendaID < agendas.length   ,"_AgendaID is invalid." );   
        /*
        require( _AgendaID < agendas.length && agendas[_AgendaID].status == AgendaStatus.IN_PROGRESS ,"agenda has expired." );   
        require( getAgendaExpirationTimeSeconds(_AgendaID) < now && agendas[_AgendaID].target != address(0), "for this agenda, the voting time is not expired" );
        require( agendas[_AgendaID].result == AgendaResult.ACCEPT , "for this agenda, not accept" );
        require( !agendas[_AgendaID].executed , "for this agenda, already executed" );
        */
        Agenda storage curagenda = agendas[_AgendaID];
        curagenda.executed = true;
        curagenda.times[4] = now; 
        curagenda.status = AgendaStatus.EXEC;
        numExecAgendas = numExecAgendas.add(1);
        
        return ( true, uint(curagenda.result), curagenda.executed, curagenda.target, curagenda.functionBytecode );
    }   
     
}
