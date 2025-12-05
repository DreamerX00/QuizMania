-- CreateTable
CREATE TABLE "RoomInviteLink" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomInviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomInviteLink_token_key" ON "RoomInviteLink"("token");

-- CreateIndex
CREATE INDEX "RoomInviteLink_token_idx" ON "RoomInviteLink"("token");

-- CreateIndex
CREATE INDEX "RoomInviteLink_roomId_idx" ON "RoomInviteLink"("roomId");

-- AddForeignKey
ALTER TABLE "RoomInviteLink" ADD CONSTRAINT "RoomInviteLink_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInviteLink" ADD CONSTRAINT "RoomInviteLink_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
