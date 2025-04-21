-- CreateTable
CREATE TABLE "location" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "max_capacity" INTEGER NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_price" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "people_count" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "location_id" BIGINT NOT NULL,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "location_price_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "location_price" ADD CONSTRAINT "location_price_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
