import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/quizzes/live
 *
 * Returns currently active quiz rooms for the live map
 */
export async function GET() {
  try {
    // Get active rooms from the last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const activeRooms = await prisma.room.findMany({
      where: {
        status: {
          in: ["WAITING", "IN_PROGRESS"],
        },
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      include: {
        quiz: {
          select: {
            title: true,
            field: true,
          },
        },
        host: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to map format with mock coordinates
    // In a real app, you'd store user locations or use room region settings
    const regions = [
      { lat: 28.6139, lng: 77.209, name: "Delhi" },
      { lat: 19.076, lng: 72.8777, name: "Mumbai" },
      { lat: 13.0827, lng: 80.2707, name: "Chennai" },
      { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
      { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
      { lat: 17.385, lng: 78.4867, name: "Hyderabad" },
      { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
      { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
      { lat: 30.7333, lng: 76.7794, name: "Chandigarh" },
      { lat: 21.1702, lng: 72.8311, name: "Surat" },
    ];

    const quizzes = activeRooms.map(
      (room: (typeof activeRooms)[number], index: number) => {
        const region = regions[index % regions.length]!;
        // Add some randomness to prevent markers from overlapping
        const jitter = () => (Math.random() - 0.5) * 0.5;

        return {
          id: room.id,
          title: room.quiz?.title || room.name || "Quiz Room",
          lat: region.lat + jitter(),
          lng: region.lng + jitter(),
          participants: room._count.members,
          creator: room.host?.name || "Anonymous",
          startedAt: room.createdAt.toISOString(),
          category: room.quiz?.field || undefined,
          roomCode: room.code,
        };
      }
    );

    return NextResponse.json({
      quizzes,
      total: quizzes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching live quizzes:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch live quizzes",
        quizzes: [],
      },
      { status: 500 }
    );
  }
}
