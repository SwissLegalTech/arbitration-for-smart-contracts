pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SmarbicoBase.sol";

contract TestSmarbicoBase {
    function testInitialSetup() {
        SmarbicoBase base = SmarbicoBase(DeployedAddresses.SmarbicoBase());
        Assert.equal(base.sellerCount, 0 , "Expected no registered sellers");
    }
}
