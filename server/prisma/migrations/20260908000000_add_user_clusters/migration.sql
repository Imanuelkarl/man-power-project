-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "geoType" TEXT NOT NULL,
    "regions" JSONB NOT NULL,
    "states" JSONB NOT NULL,
    "lgas" JSONB NOT NULL,
    "wards" JSONB NOT NULL,
    "manufacturerIds" JSONB NOT NULL,
    "focalPoint" JSONB,
    "radiusKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cluster_ownerUserId_idx" ON "Cluster"("ownerUserId");

-- AddForeignKey
ALTER TABLE "Cluster" ADD CONSTRAINT "Cluster_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;