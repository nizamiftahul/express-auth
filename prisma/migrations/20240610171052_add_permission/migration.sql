-- CreateTable
CREATE TABLE "c_permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "c_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "c_role_permission" (
    "id" SERIAL NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "c_permission_id" INTEGER NOT NULL,
    "c_role_id" INTEGER NOT NULL,

    CONSTRAINT "c_role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "c_permission_name_key" ON "c_permission"("name");

-- AddForeignKey
ALTER TABLE "c_role_permission" ADD CONSTRAINT "c_role_permission_c_permission_id_fkey" FOREIGN KEY ("c_permission_id") REFERENCES "c_permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c_role_permission" ADD CONSTRAINT "c_role_permission_c_role_id_fkey" FOREIGN KEY ("c_role_id") REFERENCES "c_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
