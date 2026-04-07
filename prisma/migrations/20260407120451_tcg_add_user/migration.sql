/*
  Warnings:

  - Added the required column `user_id` to the `tcg_application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tcg_application" ADD COLUMN     "user_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "tcg_application" ADD CONSTRAINT "tcg_application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
