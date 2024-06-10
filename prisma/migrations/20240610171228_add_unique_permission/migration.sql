/*
  Warnings:

  - A unique constraint covering the columns `[c_permission_id,c_role_id]` on the table `c_role_permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "c_role_permission_c_permission_id_c_role_id_key" ON "c_role_permission"("c_permission_id", "c_role_id");
