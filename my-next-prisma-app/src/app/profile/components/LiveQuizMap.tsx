"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveQuiz {
  id: string;
  title: string;
  lat: number;
  lng: number;
  participants: number;
  creator: string;
  startedAt: string;
  category?: string;
}

// Custom marker icon - will be initialized after leaflet loads
const createQuizMarkerIcon = (leaflet: typeof L, participants: number) => {
  const size = Math.min(20 + participants * 2, 40);
  return leaflet.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-${size} h-${size} bg-linear-to-br from-purple-500 to-indigo-600 rounded-full animate-ping opacity-40"></div>
        <div class="relative w-8 h-8 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
          ${participants}
        </div>
      </div>
    `,
    className: "quiz-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export function LiveQuizMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveQuizzes, setLiveQuizzes] = useState<LiveQuiz[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch live quizzes
  useEffect(() => {
    const fetchLiveQuizzes = async () => {
      try {
        const response = await fetch("/api/quizzes/live");
        if (response.ok) {
          const data = await response.json();
          setLiveQuizzes(data.quizzes || []);
        } else {
          // Use mock data if API not available
          setLiveQuizzes([
            {
              id: "1",
              title: "Science Quiz Challenge",
              lat: 28.6139,
              lng: 77.209,
              participants: 12,
              creator: "QuizMaster",
              startedAt: new Date().toISOString(),
              category: "Science",
            },
            {
              id: "2",
              title: "History Trivia",
              lat: 19.076,
              lng: 72.8777,
              participants: 8,
              creator: "HistoryBuff",
              startedAt: new Date().toISOString(),
              category: "History",
            },
            {
              id: "3",
              title: "Math Olympics",
              lat: 13.0827,
              lng: 80.2707,
              participants: 15,
              creator: "MathGenius",
              startedAt: new Date().toISOString(),
              category: "Mathematics",
            },
            {
              id: "4",
              title: "Geography Quest",
              lat: 22.5726,
              lng: 88.3639,
              participants: 6,
              creator: "GeoExplorer",
              startedAt: new Date().toISOString(),
              category: "Geography",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching live quizzes:", err);
        setError("Unable to load live quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveQuizzes();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveQuizzes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (!mapRef.current || leafletMapRef.current) return;

      // Fix for default marker icons in Next.js
      // @ts-expect-error - Leaflet types issue
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create map centered on India
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tiles (free)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Add markers for live quizzes
  useEffect(() => {
    if (!leafletMapRef.current || liveQuizzes.length === 0) return;

    // Dynamically import leaflet for marker operations
    import("leaflet").then((L) => {
      if (!leafletMapRef.current) return;

      const map = leafletMapRef.current;

      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add markers for each live quiz
      liveQuizzes.forEach((quiz) => {
        const marker = L.marker([quiz.lat, quiz.lng], {
          icon: createQuizMarkerIcon(L, quiz.participants),
        });

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-purple-700 text-sm">${quiz.title}</h3>
            <p class="text-xs text-gray-600 mt-1">
              <span class="font-semibold">Creator:</span> ${quiz.creator}
            </p>
            <p class="text-xs text-gray-600">
              <span class="font-semibold">Participants:</span> ${
                quiz.participants
              }
            </p>
            ${
              quiz.category
                ? `<p class="text-xs text-gray-600"><span class="font-semibold">Category:</span> ${quiz.category}</p>`
                : ""
            }
            <button 
              class="mt-2 w-full bg-linear-to-r from-purple-500 to-indigo-600 text-white text-xs py-1 px-3 rounded-lg hover:opacity-90 transition"
              onclick="window.location.href='/quiz/join/${quiz.id}'"
            >
              Join Quiz
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);
      });
    });
  }, [liveQuizzes]);

  return (
    <motion.div
      className="relative bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 -left-8 w-16 h-16 bg-linear-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/30 dark:to-purple-400/20 rounded-full blur-2xl animate-float z-0" />
      <div
        className="absolute bottom-0 right-0 w-12 h-12 bg-linear-to-br from-blue-400/10 to-pink-400/10 dark:from-blue-400/20 dark:to-pink-400/20 rounded-full blur-2xl animate-float z-0"
        style={{ animationDelay: "2s" }}
      />

      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs font-medium text-red-500 dark:text-red-400">
          LIVE
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {liveQuizzes.length} active quizzes
        </span>
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-64 md:h-80 rounded-xl overflow-hidden z-10 relative border border-gray-200 dark:border-white/10"
        style={{ background: "#e8e8e8" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Loading map...
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mt-3 text-xs z-10 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">
              {liveQuizzes.reduce((sum, q) => sum + q.participants, 0)} players
              online
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.setView([20.5937, 78.9629], 4);
            }
          }}
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          Reset View
        </button>
      </div>
    </motion.div>
  );
}
