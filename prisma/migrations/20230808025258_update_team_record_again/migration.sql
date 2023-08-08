/*
  Warnings:

  - A unique constraint covering the columns `[team_id]` on the table `team_record` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `team_record_team_id_key` ON `team_record`(`team_id`);
