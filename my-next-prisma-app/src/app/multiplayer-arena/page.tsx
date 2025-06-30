"use client";
import React from 'react';
import GameSetup from './_components/GameSetup';
import Lobby from './_components/Lobby';
import RankAndCareer from './_components/RankAndCareer';
import ClanModule from './_components/ClanModule';
import SocialChat from './_components/SocialChat';
import PublicChat from './_components/PublicChat';
import VotingSystem from './_components/VotingSystem';

export default function MultiplayerArenaPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white p-4 pt-20">
       {/* Arena View */}
       <section className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4" style={{height: 'calc(100vh - 8rem)'}}>
          {/* Left Column */}
          <div className="lg:col-span-1 h-full">
            <GameSetup />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            <div className="flex-1">
              <Lobby />
            </div>
            <div className="flex-1">
              <VotingSystem />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full">
            <div className="flex-1">
                <SocialChat />
            </div>
            <div className="flex-1">
                <PublicChat />
            </div>
          </div>
       </section>

       {/* Career & Community View (on scroll) */}
       <section className="mt-8">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[500px]"><RankAndCareer /></div>
                <div className="h-[500px]"><ClanModule /></div>
            </div>
       </section>
    </main>
  );
} 