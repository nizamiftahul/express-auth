-- CreateTable
CREATE TABLE "c_user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "activeToken" TEXT,
    "resetToken" TEXT,
    "c_role_id" INTEGER NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "c_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "c_role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "c_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "c_user_email_key" ON "c_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "c_role_name_key" ON "c_role"("name");

-- AddForeignKey
ALTER TABLE "c_user" ADD CONSTRAINT "c_user_c_role_id_fkey" FOREIGN KEY ("c_role_id") REFERENCES "c_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
