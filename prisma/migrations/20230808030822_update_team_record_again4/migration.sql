-- DropForeignKey
ALTER TABLE `teams` DROP FOREIGN KEY `teams_team_id_fkey`;

-- AddForeignKey
ALTER TABLE `team_record` ADD CONSTRAINT `team_record_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
