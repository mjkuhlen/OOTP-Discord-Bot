import { EmbedBuilder, SlashCommandBuilder, codeBlock } from "discord.js";
import { client } from "../..";
import path from "path";
import readCSV from "../../utilities/readCSV";
import { AppDataSource } from "../../datasource";
import { GameDate } from "../../entity/gamedate";
import dayjs from "dayjs";

// Function to read and parse specific player fields from CSV data
async function readPlayerData(players: any, playerID: string) {
    const foundPlayer = await players.find((player:any) => (player.player_id === playerID));
    return {
        player_id: foundPlayer.player_id,
        team_id: foundPlayer.team_id,
        first_name: foundPlayer.first_name,
        last_name: foundPlayer.last_name
    }
  }

// Function to read and parse specific player fields from CSV data
async function readTeamData(teams: any, teamID: string) {
    const foundTeam = await teams.find((team:any) => (team.team_id === teamID))
    return {
        team_id: foundTeam.team_id,
        nickname: foundTeam.nickname
    }
  }

export default new client.command({
    structure: new SlashCommandBuilder()
    .setName('team')
    .setDescription('Replies with a team news summary for the last 7 days.')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The team to look up.')
            .setRequired(true)),
    run: async (client, interaction) => {
        try {
            const teamName = interaction.options.getString('name'); //Get team nickname from User
            await interaction.deferReply();
            const league_id = '200'; //In the event of duplicate team nicknames, set league_id to choose team from MLB

            //Find CSV files
			const teamsPath = path.join(__dirname, '..', '..', 'csv', 'teams.csv');
            const teamRecordPath = path.join(__dirname, '..', '..', 'csv', 'team_record.csv');
            const gamesPath = path.join(__dirname, '..', '..', 'csv', 'games.csv');
            const playersPath = path.join(__dirname, '..', '..', 'csv', 'players.csv');

            //Process CSV files
			const teams:any = await readCSV(teamsPath);
			const teamRecords:any = await readCSV(teamRecordPath);
            const games:any = await readCSV(gamesPath);
            const players:any = await readCSV(playersPath);

            //Get team based on their nickname and league_id.  Will use this info to find additional data about team. 
            const csvTeam = teams.find((team:any) => (team.nickname.toLowerCase() === teamName?.toLowerCase() && team.league_id === league_id));

            //Get team record
            const csvTeamRecord = teamRecords.find((team:any) => (team.team_id === csvTeam.team_id));

            //Get the gamedate and the date of 1 week prior
            const dateRepo = AppDataSource.getRepository(GameDate);
            const gameDate = await dateRepo.findOne({where: {id: 1}});
            const previousWeek = new Date(dayjs(gameDate?.date).subtract(8, 'days').format('YYYY-M-D'));
            const currentDate = new Date(dayjs(gameDate?.date).format('YYYY-M-D'));

            //Find the last 7 days of games for the specified team
            const filteredGames: any[] = [];
            const gameLines: any[] = [];
            let wins = 0;
            let losses = 0;
            await Promise.all(games.map(async (game:any) => {
                const gameDay = new Date(dayjs(game.date).format('YYYY-M-D'));
                if((gameDay >= previousWeek && gameDay < currentDate) && (game.home_team === csvTeam.team_id || game.away_team === csvTeam.team_id)) {
                    // Look up player information for winning pitcher, losing pitcher, save pitcher, starter0, and starter1
                    const winningPitcher = await readPlayerData(players, game.winning_pitcher);
                    const losingPitcher = await readPlayerData(players, game.losing_pitcher);
                    const starter0 = await readPlayerData(players, game.starter0);
                    const starter1 = await readPlayerData(players, game.starter1);

                    // Look up team information
                    const home_team = await readTeamData(teams, game.home_team);
                    const away_team = await readTeamData(teams, game.away_team);

                    // Add player information to the game object
                    const gameWithPlayerInfo = {
                        ...game,
                        home_team: home_team,
                        away_team: away_team,
                        winning_pitcher: winningPitcher,
                        losing_pitcher: losingPitcher,
                        starter0: starter0,
                        starter1: starter1,
                    };

                    if((await home_team)?.team_id === csvTeam.team_id) {
                        if(gameWithPlayerInfo.runs1 > gameWithPlayerInfo.runs0) {
                            wins = wins + 1
                        } else {
                            losses = losses + 1
                        }
                    };

                    if((await away_team).team_id === csvTeam.team_id) {
                        if(gameWithPlayerInfo.runs0 > gameWithPlayerInfo.runs1) {
                            wins = wins + 1
                        } else {
                            losses = losses + 1
                        }
                    };

                    const newGame = {
                        name:`${gameWithPlayerInfo.date} - ${gameWithPlayerInfo.away_team.nickname} ${gameWithPlayerInfo.runs0} @ ${gameWithPlayerInfo.home_team.nickname} ${gameWithPlayerInfo.runs1}`,
                        value:`W: ${gameWithPlayerInfo.winning_pitcher.first_name} ${gameWithPlayerInfo.winning_pitcher.last_name} L: ${gameWithPlayerInfo.losing_pitcher.first_name} ${gameWithPlayerInfo.losing_pitcher.last_name}`
                    };

                    gameLines.push(newGame);
                    filteredGames.push(gameWithPlayerInfo);
                }
            }));
;
            let response: string = `Over the last 7 days the ${csvTeam.nickname} have ${wins} wins and ${losses} losses. For the season they are ${csvTeamRecord.w}-${csvTeamRecord.l} that's a winning percentage of ${Number(csvTeamRecord.pct).toFixed(2)}. `
            let streak: string = ''
            if(csvTeamRecord.streak > 0) {
                streak = `The ${csvTeam.nickname} are currently on a ${csvTeamRecord.streak} winning streak. `
            };
            let gb: string = ''
            if(csvTeamRecord.gb > 0) {
                gb = `They are ${Number(csvTeamRecord.gb).toFixed(2)} behind the division leader.`
            } else {
                gb = 'They are in first place in their division.'
            };

            const description = response.concat(streak, gb)
            const embed = new EmbedBuilder()
                .setTitle(`This week in ${csvTeam.nickname} News`)
                .setDescription(description)
                .setFields(gameLines)
                .setColor('#0099ff');

            await interaction.editReply({ embeds: [embed] })
        } catch (err) {
            console.error(err);
        }
    }
})