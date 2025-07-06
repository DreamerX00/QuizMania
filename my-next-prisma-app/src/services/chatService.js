"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllUserMessages = exports.getFriendChat = exports.createFriendChat = exports.getPublicChat = exports.createPublicChat = exports.getRoomChat = exports.createRoomChat = exports.getClanChat = exports.createClanChat = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Clan Chat
const createClanChat = async (clanId, userId, message) => {
    return prisma_1.default.clanChat.create({ data: { clanId, userId, message } });
};
exports.createClanChat = createClanChat;
const getClanChat = async (clanId, limit = 50) => {
    return prisma_1.default.clanChat.findMany({
        where: { clanId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { user: true }
    });
};
exports.getClanChat = getClanChat;
// Room Chat
const createRoomChat = async (roomId, userId, message) => {
    return prisma_1.default.roomChat.create({ data: { roomId, userId, message } });
};
exports.createRoomChat = createRoomChat;
const getRoomChat = async (roomId, limit = 50) => {
    return prisma_1.default.roomChat.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { user: true }
    });
};
exports.getRoomChat = getRoomChat;
// Public Chat
const createPublicChat = async (senderId, message) => {
    return prisma_1.default.publicChat.create({ data: { senderId, message } });
};
exports.createPublicChat = createPublicChat;
const getPublicChat = async (limit = 50) => {
    return prisma_1.default.publicChat.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { sender: true }
    });
};
exports.getPublicChat = getPublicChat;
// Friend Chat
const createFriendChat = async (senderId, receiverId, message) => {
    return prisma_1.default.friendChat.create({ data: { senderId, receiverId, message } });
};
exports.createFriendChat = createFriendChat;
const getFriendChat = async (userA, userB, limit = 50) => {
    return prisma_1.default.friendChat.findMany({
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
exports.getFriendChat = getFriendChat;
// GDPR Delete
const deleteAllUserMessages = async (userId) => {
    await prisma_1.default.clanChat.deleteMany({ where: { userId } });
    await prisma_1.default.roomChat.deleteMany({ where: { userId } });
    await prisma_1.default.publicChat.deleteMany({ where: { senderId: userId } });
    await prisma_1.default.friendChat.deleteMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] }
    });
};
exports.deleteAllUserMessages = deleteAllUserMessages;
