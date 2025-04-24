"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface MenuItem {
  name: string;
  price: bigint;
  inventory: number;
  itemType: number;
  isAvailable: boolean;
}

interface Order {
  id: number;
  customer: string;
  itemIds: number[];
  quantities: number[];
  totalPrice: bigint;
  timestamp: bigint;
  fulfilled: boolean;
}

const AdminPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);

  // Form states for adding new item
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemInventory, setNewItemInventory] = useState("");
  const [newItemType, setNewItemType] = useState("0");

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: ownerData } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "owner",
  });

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: menuItemsData } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "getAllMenuItems",
  });

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: orderCount } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "orderCount",
  });

  // Contract write functions
  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { writeContractAsync: addMenuItem } = useScaffoldWriteContract({
    contractName: "FoodTruck",
  });

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { writeContractAsync: updateInventory } = useScaffoldWriteContract({
    contractName: "FoodTruck",
  });

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { writeContractAsync: setItemAvailability } = useScaffoldWriteContract({
    contractName: "FoodTruck",
  });

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { writeContractAsync: fulfillOrder } = useScaffoldWriteContract({
    contractName: "FoodTruck",
  });

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { writeContractAsync: withdraw } = useScaffoldWriteContract({
    contractName: "FoodTruck",
  });

  useEffect(() => {
    if (ownerData && connectedAddress) {
      setOwnerAddress(ownerData);
      setIsOwner(connectedAddress.toLowerCase() === ownerData.toLowerCase());
    }
  }, [ownerData, connectedAddress]);

  useEffect(() => {
    if (menuItemsData && Array.isArray(menuItemsData)) {
      setMenuItems(
        menuItemsData.map((item: any) => ({
          name: item.name,
          price: item.price,
          inventory: Number(item.inventory),
          itemType: Number(item.itemType),
          isAvailable: item.isAvailable,
        })),
      );
    }
  }, [menuItemsData]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!orderCount) return;

      const orders = [];
      for (let i = 0; i < Number(orderCount); i++) {
        // @ts-ignore - The FoodTruck contract will be recognized once deployed
        const orderData = await window.scaffoldReadContract({
          contractName: "FoodTruck",
          functionName: "orders",
          args: [i],
        });

        if (orderData && !orderData.fulfilled) {
          orders.push({
            id: i,
            ...orderData,
          });
        }
      }

      setPendingOrders(orders);
    };

    fetchOrders();
  }, [orderCount]);

  const handleAddItem = async () => {
    if (!isOwner) {
      notification.error("Only the owner can add items");
      return;
    }

    try {
      // @ts-ignore - The FoodTruck contract will be recognized once deployed
      await addMenuItem({
        functionName: "addMenuItem",
        // @ts-ignore - Type compatibility with contract is ensured by viem
        args: [newItemName, parseEther(newItemPrice), Number(newItemInventory), Number(newItemType)],
      });

      notification.success("Item added successfully!");

      // Reset form
      setNewItemName("");
      setNewItemPrice("");
      setNewItemInventory("");
      setNewItemType("0");
    } catch (error) {
      console.error("Error adding item:", error);
      notification.error("Failed to add item");
    }
  };

  const handleUpdateInventory = async (itemId: number, newInventory: number) => {
    if (!isOwner) {
      notification.error("Only the owner can update inventory");
      return;
    }

    try {
      // @ts-ignore - The FoodTruck contract will be recognized once deployed
      await updateInventory({
        functionName: "updateInventory",
        // @ts-ignore - Type compatibility with contract is ensured by viem
        args: [itemId, newInventory],
      });

      notification.success("Inventory updated successfully!");
    } catch (error) {
      console.error("Error updating inventory:", error);
      notification.error("Failed to update inventory");
    }
  };

  const handleToggleAvailability = async (itemId: number, currentStatus: boolean) => {
    if (!isOwner) {
      notification.error("Only the owner can update item availability");
      return;
    }

    try {
      // @ts-ignore - The FoodTruck contract will be recognized once deployed
      await setItemAvailability({
        functionName: "setItemAvailability",
        // @ts-ignore - Type compatibility with contract is ensured by viem
        args: [itemId, !currentStatus],
      });

      notification.success("Item availability updated!");
    } catch (error) {
      console.error("Error toggling availability:", error);
      notification.error("Failed to update availability");
    }
  };

  const handleFulfillOrder = async (orderId: number) => {
    if (!isOwner) {
      notification.error("Only the owner can fulfill orders");
      return;
    }

    try {
      // @ts-ignore - The FoodTruck contract will be recognized once deployed
      await fulfillOrder({
        functionName: "fulfillOrder",
        // @ts-ignore - Type compatibility with contract is ensured by viem
        args: [orderId],
      });

      notification.success("Order marked as fulfilled!");
    } catch (error) {
      console.error("Error fulfilling order:", error);
      notification.error("Failed to fulfill order");
    }
  };

  const handleWithdraw = async () => {
    if (!isOwner) {
      notification.error("Only the owner can withdraw funds");
      return;
    }

    try {
      // @ts-ignore - The FoodTruck contract will be recognized once deployed
      await withdraw({
        functionName: "withdraw",
      });

      notification.success("Funds withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      notification.error("Failed to withdraw funds");
    }
  };

  const getItemTypeName = (typeId: number) => {
    switch (typeId) {
      case 0:
        return "Food";
      case 1:
        return "Drink";
      case 2:
        return "Dessert";
      default:
        return "Unknown";
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-y-8 py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center">Admin Panel</h1>
        <div className="bg-base-100 p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
          <p>Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col gap-y-8 py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center">Admin Panel</h1>
        <div className="bg-base-100 p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p>Only the food truck owner can access this page.</p>
          <Link href="/" className="mt-4 btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-y-8 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-col sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="flex items-center mb-4 sm:mb-0">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="w-28 hidden sm:block"></div>
        </div>

        {/* Pending Orders */}
        <div className="bg-base-100 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Pending Orders</h2>

          {pendingOrders.length === 0 ? (
            <p className="text-center py-4">No pending orders</p>
          ) : (
            <div className="space-y-6">
              {pendingOrders.map(order => (
                <div key={order.id} className="card bg-base-200">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="card-title text-lg">Order #{order.id}</h3>
                        <p className="text-sm">Customer: {order.customer}</p>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleFulfillOrder(order.id)}>
                        Mark as Fulfilled
                      </button>
                    </div>

                    <div className="divider my-2"></div>

                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.itemIds.map((itemId: number, index: number) => (
                            <tr key={index}>
                              <td>{itemId}</td>
                              <td>{menuItems[itemId]?.name || `Item #${itemId}`}</td>
                              <td>{Number(order.quantities[index])}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 text-right">
                      <p className="font-bold">Total: {(Number(order.totalPrice) / 1e18).toFixed(5)} ETH</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Management */}
        <div className="bg-base-100 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Inventory Management</h2>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price (ETH)</th>
                  <th>Inventory</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, index) => (
                  <tr key={index} className={!item.isAvailable ? "text-opacity-50" : ""}>
                    <td>{index}</td>
                    <td>{item.name}</td>
                    <td>{getItemTypeName(item.itemType)}</td>
                    <td>{(Number(item.price) / 1e18).toFixed(5)}</td>
                    <td>
                      <input
                        type="number"
                        className="input input-bordered input-sm w-20"
                        value={item.inventory}
                        onChange={e => {
                          const newItems = [...menuItems];
                          newItems[index].inventory = parseInt(e.target.value);
                          setMenuItems(newItems);
                        }}
                        onBlur={() => handleUpdateInventory(index, item.inventory)}
                      />
                    </td>
                    <td>{item.isAvailable ? "Available" : "Unavailable"}</td>
                    <td>
                      <button
                        className={`btn btn-xs ${item.isAvailable ? "btn-error" : "btn-success"}`}
                        onClick={() => handleToggleAvailability(index, item.isAvailable)}
                      >
                        {item.isAvailable ? "Set Unavailable" : "Set Available"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Item */}
        <div className="bg-base-100 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Item
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Item Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="e.g., Chicken Sandwich"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Item Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newItemType}
                onChange={e => setNewItemType(e.target.value)}
              >
                <option value="0">Food</option>
                <option value="1">Drink</option>
                <option value="2">Dessert</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Price (ETH)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
                placeholder="e.g., 0.005"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Initial Inventory</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={newItemInventory}
                onChange={e => setNewItemInventory(e.target.value)}
                placeholder="e.g., 20"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              className="btn btn-primary btn-wide"
              onClick={handleAddItem}
              disabled={!newItemName || !newItemPrice || !newItemInventory}
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Withdraw Funds */}
        <div className="bg-base-100 p-6 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Withdraw Funds</h2>
          <p className="mb-4">Withdraw all ETH from the food truck contract to the owner address.</p>
          <button className="btn btn-primary" onClick={handleWithdraw}>
            Withdraw Funds
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
