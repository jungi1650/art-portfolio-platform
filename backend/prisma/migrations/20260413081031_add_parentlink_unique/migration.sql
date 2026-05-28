/*
  Warnings:

  - A unique constraint covering the columns `[parentId,studentId]` on the table `ParentLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ParentLink_parentId_studentId_key` ON `ParentLink`(`parentId`, `studentId`);
