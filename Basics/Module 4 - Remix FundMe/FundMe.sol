// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceConverter.sol";

contract FundMe {

    using PriceConverter for uint256;

    uint256 public minimumUSD = 50 * 1e18; // 1 * 10 ** 18

    address[] public funders;

    mapping(address => uint256) public addressToAmountFunders;

    function fund() public payable {
        // Checking if what was send is sufficient for transaction
        require(msg.value.getConversionRate() > minimumUSD, "Did not send enough ETH!1");
        funders.push(msg.sender);
        addressToAmountFunders[msg.sender] = msg.value;
    }

    // function getPrice() public view returns (uint256) {
    //     // ABI
    //     // Address https://rinkeby.etherscan.io/address/0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    //     (, int256 price, , , ) = priceFeed.latestRoundData();
    //     return uint256(price * 1e10);
    // }

    // function getVersion() public view returns (uint256) {
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    //     return priceFeed.version();
    // }

    // function getConversionRate(uint256 ethAmount) public view returns (uint256) {
    //     uint256 ethPrice = getPrice();
    //     uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18;
    //     return ethAmountInUSD;
    // }

   // function withdrawal() public {}

}