-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'PROCTOR', 'ADMIN', 'GATE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PROFILE', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "ExitStatus" AS ENUM ('REQUESTED', 'APPROVED', 'DENIED', 'EXITED');

-- CreateEnum
CREATE TYPE "GateStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "role" "Role" NOT NULL,
    "blockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "GateStatus" NOT NULL DEFAULT 'ONLINE',
    "locationId" TEXT,

    CONSTRAINT "gate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "coordinates" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exit" (
    "id" TEXT NOT NULL,
    "currentStatus" "ExitStatus" NOT NULL DEFAULT 'REQUESTED',
    "studentId" TEXT NOT NULL,
    "proctorId" TEXT,
    "gateUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exit_event" (
    "id" TEXT NOT NULL,
    "status" "ExitStatus" NOT NULL,
    "note" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitId" TEXT NOT NULL,

    CONSTRAINT "exit_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_universityId_key" ON "user"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_id_name_role_idx" ON "user"("id", "name", "role");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_id_userId_idx" ON "account"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "media_userId_key" ON "media"("userId");

-- CreateIndex
CREATE INDEX "media_id_mediaType_idx" ON "media"("id", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "block_name_key" ON "block"("name");

-- CreateIndex
CREATE UNIQUE INDEX "block_locationId_key" ON "block"("locationId");

-- CreateIndex
CREATE INDEX "block_id_name_idx" ON "block"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gate_name_key" ON "gate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "gate_locationId_key" ON "gate"("locationId");

-- CreateIndex
CREATE INDEX "exit_id_studentId_proctorId_gateUserId_idx" ON "exit"("id", "studentId", "proctorId", "gateUserId");

-- CreateIndex
CREATE INDEX "exit_event_status_at_exitId_idx" ON "exit_event"("status", "at", "exitId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate" ADD CONSTRAINT "gate_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit" ADD CONSTRAINT "exit_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit" ADD CONSTRAINT "exit_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit" ADD CONSTRAINT "exit_gateUserId_fkey" FOREIGN KEY ("gateUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_event" ADD CONSTRAINT "exit_event_exitId_fkey" FOREIGN KEY ("exitId") REFERENCES "exit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
