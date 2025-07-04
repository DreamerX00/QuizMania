export type RoomType = 'match' | 'clan' | 'custom';

export interface RoomTypeConfig {
  ttl: number; // in seconds
  description: string;
}

export const roomTypes: Record<RoomType, RoomTypeConfig> = {
  match: {
    ttl: 300, // 5 minutes
    description: 'Standard multiplayer match room'
  },
  clan: {
    ttl: 2592000, // 30 days
    description: 'Clan room for persistent chat and events'
  },
  custom: {
    ttl: 3600, // 1 hour
    description: 'Custom/private room for special events'
  }
};

export function validateRoomTypes() {
  const required: RoomType[] = ['match', 'clan', 'custom'];
  for (const type of required) {
    if (!roomTypes[type]) {
      throw new Error(`Missing config for room type: ${type}`);
    }
    if (typeof roomTypes[type].ttl !== 'number' || roomTypes[type].ttl <= 0) {
      throw new Error(`Invalid TTL for room type: ${type}`);
    }
  }
}

export function loadRoomTypes(): typeof roomTypes {
  return roomTypes;
} 