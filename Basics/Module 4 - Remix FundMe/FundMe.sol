// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceConverter.sol";

contract FundMe {

    using PriceConverter for uint256;

    uint256 public minimumUSD = 50 * 1e18; // 1 * 10 ** 18

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunders;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function fund() public payable {
        // Checking if what was send is sufficient for transaction
        require(msg.value.getConversionRate() > minimumUSD, "Did not send enough ETH!1");
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

        // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed!");
        // // call
        (bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed!");
        
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Sender is not the owner!");
        _;
    }

}