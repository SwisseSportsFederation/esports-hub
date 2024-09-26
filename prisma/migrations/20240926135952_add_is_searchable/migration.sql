-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'TWITCH', 'TWITTER', 'DISCORD', 'FACEBOOK', 'STEAM', 'ORIGIN', 'BATTLENET', 'UPLAY', 'WEBSITE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('ACCEPTED', 'PENDING_USER', 'PENDING_GROUP', 'PENDING_PARENT_GROUP');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('NOT_VERIFIED', 'PRE_VERIFIED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "AccessRight" AS ENUM ('MEMBER', 'MODERATOR', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'TEAM', 'ORGANISATION');

-- CreateTable
CREATE TABLE "group" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "founded" TIMESTAMP(3),
    "image" TEXT,
    "street" TEXT,
    "zip" TEXT,
    "canton_id" BIGINT,
    "game_id" BIGINT,
    "verification_level" "VerificationLevel" NOT NULL DEFAULT 'NOT_VERIFIED',
    "group_type" "EntityType" NOT NULL DEFAULT 'TEAM',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_to_group" (
    "child_id" BIGINT NOT NULL,
    "parent_id" BIGINT NOT NULL,
    "request_status" "RequestStatus" NOT NULL,

    CONSTRAINT "group_to_group_pkey" PRIMARY KEY ("child_id","parent_id")
);

-- CreateTable
CREATE TABLE "group_member" (
    "user_id" BIGINT NOT NULL,
    "group_id" BIGINT NOT NULL,
    "is_main_group" BOOLEAN NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL,
    "role" TEXT NOT NULL,
    "request_status" "RequestStatus" NOT NULL,
    "access_rights" "AccessRight" NOT NULL,

    CONSTRAINT "group_member_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "former_team" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "from" TIMESTAMPTZ(6) NOT NULL,
    "to" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "former_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "auth_id" TEXT,
    "email" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "birth_date" TIMESTAMPTZ(6),
    "description" TEXT NOT NULL,
    "image" TEXT,
    "canton_id" BIGINT,
    "verification_level" "VerificationLevel" NOT NULL DEFAULT 'NOT_VERIFIED',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "has_data_policy" BOOLEAN NOT NULL DEFAULT false,
    "is_searchable" BOOLEAN NOT NULL DEFAULT false,
    "is_superadmin" BOOLEAN DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canton" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "canton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "group_id" BIGINT,
    "user_id" BIGINT,

    CONSTRAINT "social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupToLanguage" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "_LanguageToUser" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToUser" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "group_handle_key" ON "group"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "group_to_group_child_id_key" ON "group_to_group"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "userID_name" ON "former_team"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "idx_users_auth_id" ON "user"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_handle_key" ON "user"("handle");

-- CreateIndex
CREATE INDEX "idx_cantons_name" ON "canton"("name");

-- CreateIndex
CREATE INDEX "idx_languages_name" ON "language"("name");

-- CreateIndex
CREATE INDEX "idx_games_name" ON "game"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToLanguage_AB_unique" ON "_GroupToLanguage"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToLanguage_B_index" ON "_GroupToLanguage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LanguageToUser_AB_unique" ON "_LanguageToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_LanguageToUser_B_index" ON "_LanguageToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToUser_AB_unique" ON "_GameToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToUser_B_index" ON "_GameToUser"("B");

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_canton_id_fkey" FOREIGN KEY ("canton_id") REFERENCES "canton"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_to_group" ADD CONSTRAINT "group_to_group_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_to_group" ADD CONSTRAINT "group_to_group_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "former_team" ADD CONSTRAINT "former_team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_canton_id_fkey" FOREIGN KEY ("canton_id") REFERENCES "canton"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social" ADD CONSTRAINT "social_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social" ADD CONSTRAINT "social_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToLanguage" ADD CONSTRAINT "_GroupToLanguage_A_fkey" FOREIGN KEY ("A") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToLanguage" ADD CONSTRAINT "_GroupToLanguage_B_fkey" FOREIGN KEY ("B") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LanguageToUser" ADD CONSTRAINT "_LanguageToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LanguageToUser" ADD CONSTRAINT "_LanguageToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToUser" ADD CONSTRAINT "_GameToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToUser" ADD CONSTRAINT "_GameToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
