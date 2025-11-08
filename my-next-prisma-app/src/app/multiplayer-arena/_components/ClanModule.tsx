"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Swords, Bell, Users, Settings } from "lucide-react";
import ClanModal from "../components/ClanModal"; // Adjusted import path
import useSWR from "swr";
import toast from "react-hot-toast";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ClanModule = () => {
  const {
    data: clansData,
    error: clansError,
    isLoading: clansLoading,
  } = useSWR("/api/clans?my=1", fetcher);
  const myClan = clansData?.clans?.[0] || null;
  const {
    data: membersData,
    error: membersError,
    isLoading: membersLoading,
  } = useSWR(myClan ? `/api/clans/members?clanId=${myClan.id}` : null, fetcher);
  const myMembership =
    membersData?.members?.find((m: any) => m.userId === myClan?.id) || null;
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (clansLoading)
    return (
      <div className="p-6 text-center text-slate-400">Loading clan info...</div>
    );
  if (clansError) {
    toast.error("Failed to load clan info.");
    return (
      <div className="p-6 text-center text-red-500">
        Error loading clan info.
      </div>
    );
  }
  if (!myClan)
    return (
      <div className="p-6 text-center text-slate-400">
        You are not in a clan yet.
      </div>
    );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-6 flex flex-col justify-between text-gray-900 dark:text-white border dark:border-slate-700"
      >
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
            Clan Hub
          </h2>

          {/* Clan Summary Widget */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-800 p-2 overflow-hidden">
              <Image
                src={myClan.emblemUrl}
                alt="Clan Emblem"
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {myClan.name}
            </h3>
            <p className="text-sm italic text-slate-500 dark:text-slate-400">
              {myClan.motto}
            </p>
            <div className="mt-2 text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1">
              Your Role: {myMembership?.role || "Member"}
            </div>
          </div>

          <div className="my-6 h-px bg-slate-700"></div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                setIsModalOpen(true);
                toast("Opening clan dashboard...");
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-2"
            >
              <Users size={16} /> Open Clan Dashboard
            </Button>
            {/* Join Requests button can be implemented with real data if needed */}
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 mt-4">
          Clans are a premium feature.{" "}
          <a href="/premium" className="underline hover:text-purple-400">
            Upgrade now
          </a>
          .
        </p>
      </motion.div>

      <ClanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clan={myClan}
      />
    </>
  );
};

export default ClanModule;

