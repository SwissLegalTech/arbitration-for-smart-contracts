pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

contract SmarbicoBase is Claimable {
    address public owner;
    mapping(bytes32 => bool) public sellers;
    uint public sellerCount;

    event NewSellerApproved (
        string seller
    );

    function addSeller(string seller) public onlyOwner {
        bytes32 sellerBytes32 = _stringToBytes32(seller);
        sellers[sellerBytes32] = true;
        sellerCount++;

        emit NewSellerApproved(seller);
    }

    function getSellerCount() public constant returns (uint count) {
        return sellerCount;
    }

    function isSellerKnown(string seller) public constant returns (bool result) {
        bytes32 sellerBytes32 = _stringToBytes32(seller);
        return sellers[sellerBytes32];
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
