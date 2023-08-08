-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_home_team_fkey` FOREIGN KEY (`home_team`) REFERENCES `teams`(`team_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_away_team_fkey` FOREIGN KEY (`away_team`) REFERENCES `teams`(`team_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_winning_pitcher_fkey` FOREIGN KEY (`winning_pitcher`) REFERENCES `players`(`player_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_losing_pitcher_fkey` FOREIGN KEY (`losing_pitcher`) REFERENCES `players`(`player_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_save_pitcher_fkey` FOREIGN KEY (`save_pitcher`) REFERENCES `players`(`player_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_starter0_fkey` FOREIGN KEY (`starter0`) REFERENCES `players`(`player_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_starter1_fkey` FOREIGN KEY (`starter1`) REFERENCES `players`(`player_id`) ON DELETE SET NULL ON UPDATE CASCADE;
