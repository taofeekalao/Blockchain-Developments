// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceConverter.sol";

contract FundMe {
// 931,607
// 954,067

    using PriceConverter for uint256;
    // constant and immutable variable saving gas
    // stored in contract's byte code instead of storage
    
    uint256 public constant MINIMUM_USD = 50 * 1e18; // 1 * 10 ** 18
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunders;
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        // Checking if what was send is sufficient for transaction
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

        // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed!");
        // // call
        // (bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");

        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed!");   
    }

    modifier onlyOwner {
        require(msg.sender == i_owner, "Sender is not the owner!");
        _;
    }
}