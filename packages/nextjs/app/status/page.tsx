"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface MenuItem {
  name: string;
  price: bigint;
}

// Helper function to safely stringify objects with BigInt values
const safeStringify = (obj: any): string => {
  return JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value));
};

// Create a component for each individual order
const OrderItem = ({
  orderId,
  connectedAddress,
  menuItems,
}: {
  orderId: number;
  connectedAddress: string;
  menuItems: Record<number, MenuItem>;
}) => {
  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: orderData } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "orders",
    args: [BigInt(orderId)],
  });

  // Track if this is a user's order
  const [isUserOrder, setIsUserOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (orderData) {
      // Check if the contract is returning the expected data
      console.log(`Order ${orderId} data:`, orderData);

      // Try to extract customer address from the order data
      try {
        // Based on the contract structure, assuming the tuple structure
        // Assuming orderData is in the form [customer, itemIds, quantities, totalPrice, timestamp, fulfilled]
        if (Array.isArray(orderData)) {
          const customer = orderData[0]; // First element should be customer address

          if (customer && customer.toString().toLowerCase() === connectedAddress.toLowerCase()) {
            setIsUserOrder(true);

            // Convert the array to a more usable structure
            setOrderDetails({
              customer: orderData[0],
              itemIds: orderData[1], // This might be an array of item IDs
              quantities: orderData[2], // This might be an array of quantities
              totalPrice: orderData[3], // This might be a BigInt
              timestamp: orderData[4], // This might be a BigInt
              fulfilled: orderData[5], // This might be a boolean
            });
          }
        }
      } catch (err) {
        console.error("Error parsing order data:", err);
      }
    }
  }, [orderData, connectedAddress, orderId]);

  if (!isUserOrder || !orderDetails) {
    return null;
  }

  const formatTime = (timestamp: bigint | number | string) => {
    const timestampNum =
      typeof timestamp === "bigint"
        ? Number(timestamp)
        : typeof timestamp === "string"
          ? parseInt(timestamp)
          : timestamp;
    const date = new Date(timestampNum * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title text-lg">Order #{orderId}</h3>
            <p className="text-sm mt-1">
              {orderDetails.timestamp && `Placed on: ${formatTime(orderDetails.timestamp)}`}
            </p>
          </div>
          <div className="badge badge-lg">
            {orderDetails.fulfilled ? (
              <span className="text-success">Ready for pickup</span>
            ) : (
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Processing
              </span>
            )}
          </div>
        </div>

        <div className="divider my-2"></div>

        {/* Only display items if we have itemIds and quantities */}
        {orderDetails.itemIds && orderDetails.quantities && Array.isArray(orderDetails.itemIds) && (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.itemIds.map((itemId: any, index: number) => {
                  // Convert itemId to a number if it's a BigInt
                  const itemIdNum = typeof itemId === "bigint" ? Number(itemId) : Number(itemId);
                  const quantity = Number(orderDetails.quantities[index]);

                  return (
                    <tr key={index}>
                      <td>{menuItems[itemIdNum]?.name || `Item #${itemIdNum}`}</td>
                      <td>{quantity}</td>
                      <td>{menuItems[itemIdNum] ? (Number(menuItems[itemIdNum].price) / 1e18).toFixed(5) : "?"} ETH</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-right">
          {orderDetails.totalPrice && (
            <p className="font-bold">Total: {(Number(orderDetails.totalPrice) / 1e18).toFixed(5)} ETH</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [menuItems, setMenuItems] = useState<Record<number, MenuItem>>({});
  const [orderIds, setOrderIds] = useState<number[]>([]);
  const [hasOrders, setHasOrders] = useState(false);

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: menuItemsData } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "getAllMenuItems",
  });

  useEffect(() => {
    // Convert menu items to a record for easy lookup
    if (menuItemsData && Array.isArray(menuItemsData)) {
      const menuItemsRecord: Record<number, MenuItem> = {};
      menuItemsData.forEach((item: any, index: number) => {
        menuItemsRecord[index] = {
          name: item.name,
          price: item.price,
        };
      });
      setMenuItems(menuItemsRecord);
    }
  }, [menuItemsData]);

  // Check order counts
  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: orderCount } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "orderCount",
  });

  // Generate array of order IDs when orderCount changes
  useEffect(() => {
    if (orderCount) {
      console.log("Total order count:", orderCount);
      // Create an array of order IDs from 0 to orderCount-1
      const ids = Array.from({ length: Number(orderCount) }, (_, i) => i);
      setOrderIds(ids);
      if (Number(orderCount) > 0) {
        setHasOrders(true);
      }
    }
  }, [orderCount]);

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
          <h1 className="text-3xl font-bold">Order Status</h1>
          <div className="w-28 hidden sm:block"></div>
        </div>

        {!isConnected ? (
          <div className="bg-base-100 p-8 rounded-xl shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p>Please connect your wallet to view your orders.</p>
          </div>
        ) : !hasOrders ? (
          <div className="bg-base-100 p-8 rounded-xl shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">No Orders Found</h2>
            <p className="mb-4">You haven't placed any orders yet.</p>
            <p className="mb-4 text-xs">Debug Info - Total Orders on Contract: {orderCount ? Number(orderCount) : 0}</p>
            <Link href="/menu" className="btn btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="bg-base-100 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Your Orders</h2>

            <div className="space-y-6">
              {orderIds.map(id => (
                <OrderItem key={id} orderId={id} connectedAddress={connectedAddress || ""} menuItems={menuItems} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StatusPage;
