pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SmarbicoBase.sol";

contract TestSmarbicoBase {
    function testInitialSetup() {
        SmarbicoBase base = SmarbicoBase(DeployedAddresses.SmarbicoBase());
        base.claimOwnership();

        uint expectedCount = 0;

        Assert.equal(base.getContractCount(), expectedCount, "Expected initial contractCount to be 0");
    }

    function testAddContractCount() {
        SmarbicoBase base = SmarbicoBase(DeployedAddresses.SmarbicoBase());
        base.addContract('Test-123', '2645v3n47t5bv783nt59');
        base.addContract('ABC-456', '34t5zv38rjctz34ntz');
        base.addContract('XYZ-789', '54vt5674vzn6456v4');

        uint expectedCount = 3;
        Assert.equal(base.getContractCount(), expectedCount, "Expected contractCount to be 3 after adding some contracts");
    }

    function testIsContractKnown() {
        SmarbicoBase base = SmarbicoBase(DeployedAddresses.SmarbicoBase());
        base.addContract('ABC-456', '54vt5674vzn6456v4');

        bool expectedResult = true;
        Assert.equal(base.isContractKnown('ABC-456'), expectedResult, "Expected contract to be known");
    }

    function testIsContractUnknown() {
        SmarbicoBase base = SmarbicoBase(DeployedAddresses.SmarbicoBase());
        base.addContract('ABC-456', '54vt5674vzn6456v4');

        bool expectedResult = false;
        Assert.equal(base.isContractKnown('Test-789'), expectedResult, "Expected contract to be unknown");
    }
}
