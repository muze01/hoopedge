-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "shortName" TEXT,
    "leagueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "season" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "league_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeFirst" INTEGER NOT NULL,
    "homeSecond" INTEGER NOT NULL,
    "homeThird" INTEGER NOT NULL,
    "homeFourth" INTEGER NOT NULL,
    "homeTotalPoints" INTEGER NOT NULL,
    "awayFirst" INTEGER NOT NULL,
    "awaySecond" INTEGER NOT NULL,
    "awayThird" INTEGER NOT NULL,
    "awayFourth" INTEGER NOT NULL,
    "awayTotalPoints" INTEGER NOT NULL,
    "leagueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oddsline" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "line" DOUBLE PRECISION NOT NULL,
    "overOdd" DOUBLE PRECISION NOT NULL,
    "underOdd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oddsline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_leagueId_idx" ON "team"("leagueId");

-- CreateIndex
CREATE INDEX "team_name_idx" ON "team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "team_name_leagueId_key" ON "team"("name", "leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "league_name_key" ON "league"("name");

-- CreateIndex
CREATE INDEX "game_date_idx" ON "game"("date");

-- CreateIndex
CREATE INDEX "game_homeTeamId_idx" ON "game"("homeTeamId");

-- CreateIndex
CREATE INDEX "game_awayTeamId_idx" ON "game"("awayTeamId");

-- CreateIndex
CREATE INDEX "game_leagueId_idx" ON "game"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "game_date_homeTeamId_awayTeamId_leagueId_key" ON "game"("date", "homeTeamId", "awayTeamId", "leagueId");

-- CreateIndex
CREATE INDEX "oddsline_gameId_idx" ON "oddsline"("gameId");

-- CreateIndex
CREATE INDEX "oddsline_line_idx" ON "oddsline"("line");

-- CreateIndex
CREATE UNIQUE INDEX "oddsline_gameId_line_key" ON "oddsline"("gameId", "line");

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oddsline" ADD CONSTRAINT "oddsline_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
