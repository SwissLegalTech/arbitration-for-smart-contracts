pragma solidity ^0.4.24;

contract SmarbicoBase {
    address public owner;
    mapping(bytes32 => bool) public contracts;
    uint public contractCount;

    event NewContract (
        string contractId
    );

    modifier ownerNotSet() {
        require(owner == address(0x0));
        _;
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    function claimOwnership() public ownerNotSet {
        owner = msg.sender;
    }

    function addContract(string contractId) public onlyOwner {
        bytes32 idBytes32 = _stringToBytes32(contractId);
        contracts[idBytes32] = true;
        contractCount++;

        emit NewContract(contractId);
    }

    function getContractCount() public constant returns (uint count) {
        return contractCount;
    }

    function isContractKnown(string contractId) public constant returns (bool result) {
        bytes32 idBytes32 = _stringToBytes32(contractId);
        return contracts[idBytes32];
    }

    function _stringToBytes32(string memory source) private returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
