import prisma from '../lib/prisma';

// Clan Chat
export const createClanChat = async (clanId: string, userId: string, message: string) => {
  return prisma.clanChat.create({ data: { clanId, userId, message } });
};
export const getClanChat = async (clanId: string, limit = 50) => {
  return prisma.clanChat.findMany({
    where: { clanId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: true }
  });
};

// Room Chat
export const createRoomChat = async (roomId: string, userId: string, message: string) => {
  return prisma.roomChat.create({ data: { roomId, userId, message } });
};
export const getRoomChat = async (roomId: string, limit = 50) => {
  return prisma.roomChat.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: true }
  });
};

// Public Chat
export const createPublicChat = async (senderId: string, message: string) => {
  return prisma.publicChat.create({ data: { senderId, message } });
};
export const getPublicChat = async (limit = 50) => {
  return prisma.publicChat.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { sender: true }
  });
};

// Friend Chat
export const createFriendChat = async (senderId: string, receiverId: string, message: string) => {
  return prisma.friendChat.create({ data: { senderId, receiverId, message } });
};
export const getFriendChat = async (userA: string, userB: string, limit = 50) => {
  return prisma.friendChat.findMany({
    where: {
      OR: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { sender: true, receiver: true }
  });
};

// GDPR Delete
export const deleteAllUserMessages = async (userId: string) => {
  await prisma.clanChat.deleteMany({ where: { userId } });
  await prisma.roomChat.deleteMany({ where: { userId } });
  await prisma.publicChat.deleteMany({ where: { senderId: userId } });
  await prisma.friendChat.deleteMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] }
  });
}; 