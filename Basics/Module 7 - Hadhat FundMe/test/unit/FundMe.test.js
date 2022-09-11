const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function() {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1");

  beforeEach(async function() {
    //  deploy our fundMe contract
    //  using Hardhat-deploy
    //  const accounts = awaits ethers.getSigners()
    //  const accountZero = accounts[0]
    //  const { deployer } = await getNamedAccounts();

    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function() {
    it("sets the aggregator addressses correctly", async function() {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function() {
    it("Fails if you do not send enough ETH", async function() {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });

    it("updated the amount funded data structure", async function() {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("Adds funders to array of funders", async function() {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.getFunder(0);
      assert.equal(funder, deployer);
    });
  });

  describe("withdrawal", async function() {
    beforeEach(async function() {
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw ETH from a single funder", async function() {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transactResponse = await fundMe.withdrawal();
      const transactReceipt = await transactResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("Allows us to withdraw with multiple funders", async function() {
      // Arrange
      const accounts = await ethers.getSigners();
      for (let index = 0; index < 6; index++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[index]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactResponse = await fundMe.withdrawal();
      const transactReceipt = await transactResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // Assert
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      // Make sure that the funders are reset properly
      await expect(fundMe.getFunder(0)).to.be.reverted;

      for (let index = 1; index < 6; index++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[index].address),
          0
        );
      }
    });

    it("Only allows the owner to withdraw", async function() {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.withdrawal()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });

    it("Allows us to withdraw using cheaper withdrawal ...", async function() {
      // Arrange
      const accounts = await ethers.getSigners();
      for (let index = 0; index < 6; index++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[index]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactResponse = await fundMe.cheaperWithdrawal();
      const transactReceipt = await transactResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // Assert
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      // Make sure that the funders are reset properly
      await expect(fundMe.getFunder(0)).to.be.reverted;

      for (let index = 1; index < 6; index++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[index].address),
          0
        );
      }
    });

    it("Withdraw ETH from a single funder with cheaper witdrawal", async function() {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transactResponse = await fundMe.cheaperWithdrawal();
      const transactReceipt = await transactResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });
  });
});
