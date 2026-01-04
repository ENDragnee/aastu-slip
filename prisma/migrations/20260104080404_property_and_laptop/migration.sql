-- CreateTable
CREATE TABLE "Laptop" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "studentUniversityId" TEXT,
    "exitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laptop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitProperty" (
    "exitId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "ExitProperty_pkey" PRIMARY KEY ("exitId","propertyId")
);

-- AddForeignKey
ALTER TABLE "Laptop" ADD CONSTRAINT "Laptop_studentUniversityId_fkey" FOREIGN KEY ("studentUniversityId") REFERENCES "user"("universityId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laptop" ADD CONSTRAINT "Laptop_exitId_fkey" FOREIGN KEY ("exitId") REFERENCES "exit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitProperty" ADD CONSTRAINT "ExitProperty_exitId_fkey" FOREIGN KEY ("exitId") REFERENCES "exit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitProperty" ADD CONSTRAINT "ExitProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
