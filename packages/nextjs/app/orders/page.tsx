"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface MenuItem {
  name: string;
  price: bigint;
  inventory: number;
  itemType: number;
  isAvailable: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: bigint;
  quantity: number;
}

const Orders: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedItemId = searchParams.get("itemId");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<bigint>(BigInt(0));

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: menuItemsData } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "getAllMenuItems",
  });

  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { writeContractAsync: placeOrderAsync } = useScaffoldWriteContract({
    contractName: "FoodTruck",
  });

  useEffect(() => {
    if (menuItemsData && Array.isArray(menuItemsData) && preselectedItemId) {
      const itemId = parseInt(preselectedItemId);
      if (itemId >= 0 && itemId < menuItemsData.length) {
        const item = menuItemsData[itemId];
        addToCart(itemId, item.name, item.price);
      }
    }
  }, [menuItemsData, preselectedItemId]);

  useEffect(() => {
    // Calculate total price when cart changes
    let total = BigInt(0);
    cart.forEach(item => {
      total += item.price * BigInt(item.quantity);
    });
    setTotalPrice(total);
  }, [cart]);

  const addToCart = (id: number, name: string, price: bigint, quantity = 1) => {
    setCart(prevCart => {
      // Check if item is already in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === id);

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, { id, name, price, quantity }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart => prevCart.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item)));
  };

  const handlePlaceOrder = async () => {
    if (!isConnected) {
      notification.error("Please connect your wallet to place an order");
      return;
    }

    if (cart.length === 0) {
      notification.error("Your cart is empty");
      return;
    }

    try {
      const itemIds = cart.map(item => item.id);
      const quantities = cart.map(item => item.quantity);

      // @ts-ignore - The FoodTruck contract will be recognized once deployed
      const result = await placeOrderAsync({
        functionName: "placeOrder",
        args: [itemIds, quantities],
        value: totalPrice,
      });

      if (result) {
        notification.success("Order placed successfully!");
        setCart([]);
        router.push("/status");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      notification.error("Failed to place order");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-y-8 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-col sm:flex-row sm:justify-between">
          <div>
            <Link href="/menu" className="flex items-center mb-4 sm:mb-0">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Menu
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Your Order</h1>
          <div className="w-28 hidden sm:block"></div>
        </div>

        <div className="bg-base-100 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <ShoppingCartIcon className="h-6 w-6 mr-2" />
            Your Cart
          </h2>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="mb-4">Your cart is empty</p>
              <Link href="/menu" className="btn btn-primary">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div>
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{(Number(item.price) / 1e18).toFixed(5)} ETH</td>
                      <td>
                        <div className="flex items-center">
                          <button
                            className="btn btn-xs btn-circle btn-outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            className="btn btn-xs btn-circle btn-outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>{(Number(item.price * BigInt(item.quantity)) / 1e18).toFixed(5)} ETH</td>
                      <td>
                        <button className="btn btn-xs btn-error btn-outline" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-bold">
                      Total:
                    </td>
                    <td className="font-bold">{(Number(totalPrice) / 1e18).toFixed(5)} ETH</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-8 text-center">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handlePlaceOrder}
                  disabled={!isConnected || cart.length === 0}
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {menuItemsData && Array.isArray(menuItemsData) && (
          <div className="bg-base-100 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Add More Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {menuItemsData.map((item: any, index: number) => (
                <div key={index} className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title text-base">{item.name}</h3>
                    <p className="text-sm">{(Number(item.price) / 1e18).toFixed(5)} ETH</p>
                    <div className="card-actions justify-end mt-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => addToCart(index, item.name, item.price)}
                        disabled={!item.isAvailable || Number(item.inventory) === 0}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
