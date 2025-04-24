import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the FoodTruck contract using the deployer account
 * with a specific owner address and adds initial menu items
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployFoodTruck: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Set the specific owner address
  const ownerAddress = "0x417E6D64F28bd6FA5D00D757976c9bCF87D0cC3E";

  // For local testing, we can use impersonation to add items
  let actualDeployer = deployer;

  // If we're on a local network, we can impersonate the owner address
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log(`Impersonating ${ownerAddress} to deploy and add menu items...`);
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ownerAddress],
    });

    // Fund the owner address with some ETH for gas if needed
    await hre.network.provider.send("hardhat_setBalance", [
      ownerAddress,
      "0x1000000000000000000", // 1 ETH
    ]);

    // Use the owner address as the deployer
    actualDeployer = ownerAddress;
  } else {
    console.log(`Using deployer ${deployer} - only ${ownerAddress} will be able to manage the contract.`);
  }

  await deploy("FoodTruck", {
    from: actualDeployer,
    // Contract constructor arguments - using the specified owner address
    args: [ownerAddress],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const foodTruck = await hre.ethers.getContract<Contract>("FoodTruck", actualDeployer);

  // Add menu items
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    try {
      console.log("Adding initial menu items to FoodTruck...");

      // Food items - Type 0
      await foodTruck.addMenuItem("Cheeseburger", hre.ethers.parseEther("0.01"), 20, 0);
      await foodTruck.addMenuItem("Pizza Slice", hre.ethers.parseEther("0.008"), 15, 0);
      await foodTruck.addMenuItem("Hot Dog", hre.ethers.parseEther("0.005"), 30, 0);
      await foodTruck.addMenuItem("Fries", hre.ethers.parseEther("0.003"), 40, 0);

      // Drinks - Type 1
      await foodTruck.addMenuItem("Soda", hre.ethers.parseEther("0.002"), 50, 1);
      await foodTruck.addMenuItem("Water", hre.ethers.parseEther("0.001"), 100, 1);
      await foodTruck.addMenuItem("Coffee", hre.ethers.parseEther("0.003"), 30, 1);

      // Desserts - Type 2
      await foodTruck.addMenuItem("Ice Cream", hre.ethers.parseEther("0.004"), 25, 2);
      await foodTruck.addMenuItem("Chocolate Chip Cookie", hre.ethers.parseEther("0.002"), 40, 2);

      console.log("Initial menu items added successfully!");
    } catch (error) {
      console.error("Error adding menu items:", error);
    }
  } else {
    console.log(`\nFoodTruck deployed with owner address: ${ownerAddress}`);
    console.log("IMPORTANT: Only the owner can add menu items and manage the food truck.");
    console.log("To add menu items, connect with the owner wallet address and use the admin interface.");

    console.log("\nHere's a reference for menu items you might want to add:");
    console.log("Food items (Type 0):");
    console.log("- Cheeseburger: 0.01 ETH, initial inventory: 20");
    console.log("- Pizza Slice: 0.008 ETH, initial inventory: 15");
    console.log("- Hot Dog: 0.005 ETH, initial inventory: 30");
    console.log("- Fries: 0.003 ETH, initial inventory: 40");

    console.log("\nDrinks (Type 1):");
    console.log("- Soda: 0.002 ETH, initial inventory: 50");
    console.log("- Water: 0.001 ETH, initial inventory: 100");
    console.log("- Coffee: 0.003 ETH, initial inventory: 30");

    console.log("\nDesserts (Type 2):");
    console.log("- Ice Cream: 0.004 ETH, initial inventory: 25");
    console.log("- Chocolate Chip Cookie: 0.002 ETH, initial inventory: 40");
  }

  // Stop impersonating if we were impersonating
  if ((hre.network.name === "localhost" || hre.network.name === "hardhat") && actualDeployer !== deployer) {
    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [ownerAddress],
    });
    console.log(`Stopped impersonating ${ownerAddress}`);
  }
};

export default deployFoodTruck;

// Tags are useful if you have multiple deploy files and only want to run one of them.
deployFoodTruck.tags = ["FoodTruck"];
