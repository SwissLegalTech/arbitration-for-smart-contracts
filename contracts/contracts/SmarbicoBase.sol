pragma solidity ^0.4.24;

contract SmarbicoBase {
    address public owner;
    mapping(bytes32 => bytes32) public contracts;
    uint public contractCount;

    event NewContract (
        bytes32 contractId,
        bytes32 contractHash
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

    function addContract(bytes32 idBytes32, bytes32 contractHashBytes32) public onlyOwner {
        contracts[idBytes32] = contractHashBytes32;
        contractCount++;

        emit NewContract(idBytes32, contractHashBytes32);
    }

    function getContractCount() public constant returns (uint count) {
        return contractCount;
    }

    function isContractKnown(string contractId) public constant returns (bool result) {
        bytes32 idBytes32 = _stringToBytes32(contractId);

        return (contracts[idBytes32] != 0);
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
