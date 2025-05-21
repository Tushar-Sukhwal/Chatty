/*
  Warnings:

  - A unique constraint covering the columns `[share_link]` on the table `chat_groups` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chat_groups" ADD COLUMN     "is_group" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "share_link" TEXT;

-- First, add the user_id column as nullable
ALTER TABLE "group_users" ADD COLUMN "user_id" INTEGER;

-- Set a default value for existing rows (using the first user in the system)
UPDATE "group_users" SET "user_id" = (SELECT id FROM "users" LIMIT 1);

-- Now make the column non-nullable
ALTER TABLE "group_users" ALTER COLUMN "user_id" SET NOT NULL;

-- Add is_owner column
ALTER TABLE "group_users" ADD COLUMN "is_owner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "direct_chat_id" UUID,
ALTER COLUMN "group_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "direct_chats" (
    "id" UUID NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "direct_chats_sender_id_receiver_id_key" ON "direct_chats"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_groups_share_link_key" ON "chat_groups"("share_link");

-- AddForeignKey
ALTER TABLE "group_users" ADD CONSTRAINT "group_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_chats" ADD CONSTRAINT "direct_chats_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_chats" ADD CONSTRAINT "direct_chats_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_direct_chat_id_fkey" FOREIGN KEY ("direct_chat_id") REFERENCES "direct_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
