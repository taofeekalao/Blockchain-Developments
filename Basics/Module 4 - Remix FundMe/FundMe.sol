// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18; // 1 * 10 ** 18
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunders;
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        // Checking if what was sent is sufficient for transaction
        require(msg.value.getConversionRate() > MINIMUM_USD, "Did not send enough ETH!1");
        funders.push(msg.sender);
        addressToAmountFunders[msg.sender] = msg.value;
    }

    function withdrawal() public onlyOwner {
        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunders[funder] = 0;
        }
        // Reset the array after complete withdrawal
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed!");  
    }

    modifier onlyOwner {
        if(msg.sender != i_owner)
            revert NotOwner();
        _;
    }
}