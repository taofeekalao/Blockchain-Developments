// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
// pragma solidity >=0.8.8 <0.9.0

contract SimpleStorage{
    // boolean, uint, int, address, bytes

    // This gets initialised to 0.
    uint256 favouriteNumber;

    struct People {
        uint256 favouriteNumber;
        string name;
    }

    People[] public people;

    function store(uint256 _favouriteNumber) public {
        favouriteNumber = _favouriteNumber;
    }

    // view, pure 
    function retrieve() public view returns(uint256) {
        return favouriteNumber;
    }

    // EVM can access and store information in these six places
    // Stack
    // Memory   :temporary variable that CAN be modified
    // Storage  :permanent variable that CAN be modified
    // Calldata :temporary variable that CANNOT be modified
    // Code
    // Logs
    // Variable cannot be stored in Stack, Code or Logs
    function addPerson(string memory _name, uint256 _favouriteNumber) public {
        // People memory newPerson = People({favouriteNumber: _favouriteNumber, name: _name});
        //People memory newPerson = People(_favouriteNumber, _name);
        // people.push(newPerson)
        people.push(People({favouriteNumber: _favouriteNumber, name: _name}));
    }
}