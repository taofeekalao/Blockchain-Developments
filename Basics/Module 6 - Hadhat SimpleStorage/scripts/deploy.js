const { ethers, run, network } = require("hardhat");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract ...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to: ${simpleStorage.address}`);

  // Check if we are deploying to Hardhat local network
  // console.log(network.config);
  if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations ...");
    await simpleStorage.deployTransaction.wait(5);
    await verify(simpleStorage.address, []);
  }

  // Interact with the contract
  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value is: ${currentValue}`);

  // Update the current value
  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated value is: ${updatedValue}`);
}

async function verify(contractAddress, args) {
  console.log("Verifying contract ...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit;
  });
