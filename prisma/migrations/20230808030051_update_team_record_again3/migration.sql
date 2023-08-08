-- DropForeignKey
ALTER TABLE `team_record` DROP FOREIGN KEY `team_record_team_id_fkey`;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team_record`(`team_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
