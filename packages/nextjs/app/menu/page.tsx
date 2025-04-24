"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getFoodImage, getPlaceholderByType } from "~~/utils/foodImages";

interface MenuItem {
  name: string;
  price: bigint;
  inventory: number;
  itemType: number;
  isAvailable: boolean;
}

// Card component for menu items
const MenuItemCard = ({ item, index, totalOffset = 0 }: { item: MenuItem; index: number; totalOffset?: number }) => {
  const imageUrl = getFoodImage(item.name);

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <figure className="relative h-48 w-full">
        <Image src={imageUrl} alt={item.name} fill priority className="object-cover" />
      </figure>
      <div className="card-body">
        <h3 className="card-title">{item.name}</h3>
        <p>Price: {(Number(item.price) / 1e18).toFixed(5)} ETH</p>
        <p>Available: {item.inventory} left</p>
        <div className="card-actions justify-end mt-2">
          <Link href={`/orders?itemId=${totalOffset + index}`} className="btn btn-primary btn-sm">
            Order Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const Menu: NextPage = () => {
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [drinks, setDrinks] = useState<MenuItem[]>([]);
  const [desserts, setDesserts] = useState<MenuItem[]>([]);

  // Get all menu items - ignoring TS errors for now as we're extending the scaffold
  // @ts-ignore - The FoodTruck contract will be recognized once deployed
  const { data: menuItemsData } = useScaffoldReadContract({
    contractName: "FoodTruck",
    functionName: "getAllMenuItems",
  });

  useEffect(() => {
    if (menuItemsData && Array.isArray(menuItemsData)) {
      const foodItems: MenuItem[] = [];
      const drinkItems: MenuItem[] = [];
      const dessertItems: MenuItem[] = [];

      menuItemsData.forEach((item: any) => {
        // Convert the object to our MenuItem interface
        const menuItem: MenuItem = {
          name: item.name,
          price: item.price,
          inventory: Number(item.inventory),
          itemType: Number(item.itemType),
          isAvailable: item.isAvailable,
        };

        if (menuItem.itemType === 0) {
          foodItems.push(menuItem);
        } else if (menuItem.itemType === 1) {
          drinkItems.push(menuItem);
        } else if (menuItem.itemType === 2) {
          dessertItems.push(menuItem);
        }
      });

      setFoods(foodItems);
      setDrinks(drinkItems);
      setDesserts(dessertItems);
    }
  }, [menuItemsData]);

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
          <h1 className="text-3xl font-bold">Food Truck Menu</h1>
          <div className="w-28 hidden sm:block"></div> {/* For balance in flex layout */}
        </div>

        {/* Food section */}
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-primary">Foods</h2>
          {foods.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative h-32 w-32 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={getPlaceholderByType(0)}
                  alt="Food placeholder"
                  fill
                  className="object-cover animate-pulse"
                />
              </div>
              <p>Loading food items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map((food, index) => (
                <MenuItemCard key={index} item={food} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Drinks section */}
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-primary">Drinks</h2>
          {drinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative h-32 w-32 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={getPlaceholderByType(1)}
                  alt="Drink placeholder"
                  fill
                  className="object-cover animate-pulse"
                />
              </div>
              <p>Loading drink items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drinks.map((drink, index) => (
                <MenuItemCard key={index} item={drink} index={index} totalOffset={foods.length} />
              ))}
            </div>
          )}
        </section>

        {/* Desserts section */}
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-primary">Desserts</h2>
          {desserts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative h-32 w-32 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={getPlaceholderByType(2)}
                  alt="Dessert placeholder"
                  fill
                  className="object-cover animate-pulse"
                />
              </div>
              <p>Loading dessert items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {desserts.map((dessert, index) => (
                <MenuItemCard key={index} item={dessert} index={index} totalOffset={foods.length + drinks.length} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Menu;
