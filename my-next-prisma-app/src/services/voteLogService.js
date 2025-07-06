"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllUserVotes = exports.getVotesForRoom = exports.createVoteLog = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createVoteLog = async (userId, roomId, type, count = 1) => {
    return prisma_1.default.vote.upsert({
        where: { userId_roomId_type: { userId, roomId, type } },
        update: { count: { increment: count }, updatedAt: new Date() },
        create: { userId, roomId, type, count },
    });
};
exports.createVoteLog = createVoteLog;
const getVotesForRoom = async (roomId) => {
    return prisma_1.default.vote.findMany({ where: { roomId } });
};
exports.getVotesForRoom = getVotesForRoom;
const deleteAllUserVotes = async (userId) => {
    await prisma_1.default.vote.deleteMany({ where: { userId } });
};
exports.deleteAllUserVotes = deleteAllUserVotes;
