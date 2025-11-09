import prisma from '../lib/prisma';

export const createVoteLog = async (userId: string, roomId: string, type: string, count = 1) => {
  return prisma.vote.upsert({
    where: { userId_roomId_type: { userId, roomId, type } },
    update: { count: { increment: count }, updatedAt: new Date() },
    create: { userId, roomId, type, count },
  });
};

export const getVotesForRoom = async (roomId: string) => {
  return prisma.vote.findMany({ where: { roomId } });
};

export const deleteAllUserVotes = async (userId: string) => {
  await prisma.vote.deleteMany({ where: { userId } });
}; 
