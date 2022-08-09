// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract FundMe {
    function fund() public payable {
        // Checking if what was send is sufficient for transaction
        require(msg.value > 1e18, "Did not send enough ETH!1");
    }

   // function withdrawal() public {}
}