/*
  Warnings:

  - A unique constraint covering the columns `[name,country]` on the table `league` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "league_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "league_name_country_key" ON "league"("name", "country");
