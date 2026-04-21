-- AlterTable
ALTER TABLE "tcg_application" ADD COLUMN     "discord_handle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "drawer" TEXT,
ADD COLUMN     "is_finished" BOOLEAN DEFAULT false;
