import { EmbedBuilder, SlashCommandBuilder, codeBlock } from "discord.js";
import { client } from "../..";
import path from "path";
import readCSV from "../../utilities/readCSV";
import { AppDataSource } from "../../datasource";
import { GameDate } from "../../entity/gamedate";
import dayjs from "dayjs";
import { PrismaClient } from '@prisma/client'

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
            const prisma = new PrismaClient();
            await interaction.deferReply();
            const league_id = 200; //In the event of duplicate team nicknames, set league_id to choose team from MLB
            let wins = 0;
            let losses = 0;

            const gameLines: any[] = [];

            const dateRepo = AppDataSource.getRepository(GameDate);
            const gameDate = await dateRepo.findOne({where: {id: 1}});
            const currentDate = dayjs(gameDate?.date).toDate();
            const previousWeek = dayjs(gameDate?.date).subtract(8, 'days').toDate();

            const pTeam:any = await prisma.teams.findFirst({where: {
                nickname: interaction.options.getString('name'), league_id: league_id
            }});
            const pRecord:any = await prisma.team_record.findFirst({where: {
                team_id: pTeam?.team_id
            }});
            const pGames = await prisma.games.findMany({
                where: {
                    league_id: league_id,
                    AND: [
                        {
                            date: 
                                {
                                    gte: previousWeek
                                }
                        },
                        {
                            date:
                                {
                                    lte: currentDate
                                }
                        }
                    ],
                    OR: [
                        {
                            home_team: pTeam?.team_id
                        },
                        {
                            away_team: pTeam?.team_id
                        }
                    ]
                }
            });

            await Promise.all(pGames.map(async (game:any) => {
                const winningPitcher = await prisma.players.findFirst({
                    where: {
                        player_id: game.winning_pitcher
                    }
                });
                const losingPitcher = await prisma.players.findFirst({
                    where: {
                        player_id: game.losing_pitcher
                    }
                });
                const starter0 = await prisma.players.findFirst({
                    where: {
                        player_id: game.starter0
                    }
                });
                const starter1 = await prisma.players.findFirst({
                    where: {
                        player_id: game.starter1
                    }
                });

                const home_team = await prisma.teams.findFirst({
                    where: {
                        team_id: game.home_team
                    }
                });
                const away_team = await prisma.teams.findFirst({
                    where: {
                        team_id: game.away_team
                    }
                });
                
                const gameWithPlayerInfo= {
                    ...game,
                    home_team: home_team,
                    away_team: away_team,
                    winning_pitcher: winningPitcher,
                    losing_pitcher: losingPitcher,
                    starter0: starter0,
                    starter1: starter1
                };

                if(await home_team?.team_id === pTeam?.team_id) {
                    if(gameWithPlayerInfo.runs0 > gameWithPlayerInfo.runs1) {
                        wins = wins + 1;
                    } else {
                        losses = losses + 1;
                    }
                };

                if(await away_team?.team_id === pTeam?.team_id) {
                    if(gameWithPlayerInfo.runs0 > gameWithPlayerInfo.runs1) {
                        wins = wins + 1;
                    } else {
                        losses = losses + 1;
                    }
                };

                const newGame = {
                    name:`${gameWithPlayerInfo.date} - ${gameWithPlayerInfo.away_team.nickname} ${gameWithPlayerInfo.runs0} @ ${gameWithPlayerInfo.home_team.nickname} ${gameWithPlayerInfo.runs1}`,
                    value:`W: ${gameWithPlayerInfo.winning_pitcher.first_name} ${gameWithPlayerInfo.winning_pitcher.last_name} L: ${gameWithPlayerInfo.losing_pitcher.first_name} ${gameWithPlayerInfo.losing_pitcher.last_name}`
                };

                gameLines.push(newGame);

            }));

            let opening: string = '';

            if(pGames.length > 0) {
                opening = `Over the last week the ${pTeam?.nickname} have ${wins} wins and ${losses} losses. `
            } else {
                opening = `The ${pTeam?.nickname} didn't play any games this week. `
            }
            let response: string = `For the season they are ${pRecord?.w}-${pRecord?.l} that's a winning percentage of ${Number(pRecord?.pct).toFixed(2)}. `
            let streak: string = ''
            if(pRecord?.streak > 0) {
                streak = `The ${pTeam?.nickname} are currently on a ${pRecord?.streak} winning streak. `
            };
            let gb: string = ''
            if(pRecord?.gb > 0) {
                gb = `They are ${Number(pRecord?.gb).toFixed(2)} behind the division leader.`
            } else {
                gb = 'They are in first place in their division.'
            };

            response = opening.concat(response);
            const description = response.concat(streak, gb);

            const embed = new EmbedBuilder()
                .setTitle(`This week in ${pTeam?.nickname} News`)
                .setDescription(description)
                .setFields(gameLines)
                .setColor('#0099ff');
            
            await prisma.$disconnect();
            await interaction.editReply({ embeds: [embed] })
        } catch (err) {
            console.error(err);
            await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
})