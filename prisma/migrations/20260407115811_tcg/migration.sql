-- CreateTable
CREATE TABLE "tcg_application" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "inspiration" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "special_traits" TEXT NOT NULL,
    "comments" TEXT,
    "checked_main_team" BOOLEAN NOT NULL,
    "has_data_policy" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tcg_application_pkey" PRIMARY KEY ("id")
);
