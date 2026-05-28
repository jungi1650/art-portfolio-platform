/*
  Warnings:

  - You are about to alter the column `tokenId` on the `portfolio` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `portfolio` DROP FOREIGN KEY `Portfolio_userId_fkey`;

-- DropIndex
DROP INDEX `Portfolio_userId_fkey` ON `portfolio`;

-- AlterTable
ALTER TABLE `portfolio` ADD COLUMN `contractAddress` VARCHAR(191) NULL,
    ADD COLUMN `ownerAddress` VARCHAR(191) NULL,
    ADD COLUMN `txHash` VARCHAR(191) NULL,
    MODIFY `tokenId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Portfolio` ADD CONSTRAINT `Portfolio_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
