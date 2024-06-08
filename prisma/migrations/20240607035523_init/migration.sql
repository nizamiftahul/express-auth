-- CreateTable
CREATE TABLE "c_user" (
    "id" SERIAL NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" TEXT,
    "photo" TEXT,
    "last_login" TIMESTAMP(3),
    "c_role_id" INTEGER NOT NULL,
    "creted_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "c_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "c_role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "creted_by" INTEGER,
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
