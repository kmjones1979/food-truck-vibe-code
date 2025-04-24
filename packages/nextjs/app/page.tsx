"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ArchiveBoxIcon, CurrencyDollarIcon, TruckIcon } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-6">
            <span className="block text-4xl font-bold">Blockchain Food Truck</span>
            <span className="block text-2xl mt-2">Order delicious meals on the blockchain!</span>
          </h1>
          <div className="flex justify-center">
            <TruckIcon className="h-24 w-24 text-yellow-600 mr-2" />
          </div>
          <p className="text-center text-lg mt-8 max-w-3xl mx-auto">
            Experience food ordering like never before. Our blockchain-powered food truck offers a secure, transparent
            way to order delicious meals, refreshing drinks, and sweet desserts.
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-xl">
              <ArchiveBoxIcon className="h-8 w-8 fill-secondary" />
              <p className="font-semibold my-3">View Our Menu</p>
              <Link href="/menu" className="btn btn-primary btn-md">
                Browse Menu
              </Link>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-xl">
              <CurrencyDollarIcon className="h-8 w-8 fill-secondary" />
              <p className="font-semibold my-3">Place Orders</p>
              <Link href="/orders" className="btn btn-primary btn-md">
                Order Now
              </Link>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-xl">
              <MagnifyingGlassIcon className="h-8 w-8 stroke-secondary" />
              <p className="font-semibold my-3">Order Status</p>
              <Link href="/status" className="btn btn-primary btn-md">
                Check Status
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 mb-10 text-center">
          <h2 className="text-2xl font-bold mb-3">How it Works</h2>
          <ol className="list-decimal list-inside text-left max-w-lg mx-auto">
            <li className="my-2">Browse our menu of foods, drinks, and desserts</li>
            <li className="my-2">Connect your Ethereum wallet</li>
            <li className="my-2">Place your order and pay with ETH</li>
            <li className="my-2">Receive a notification when your order is ready</li>
            <li className="my-2">Enjoy your blockchain-powered meal!</li>
          </ol>
          <div className="mt-6">
            <Link href="/debug" className="btn btn-sm btn-outline">
              <BugAntIcon className="h-4 w-4 mr-1" />
              Debug Contracts
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
