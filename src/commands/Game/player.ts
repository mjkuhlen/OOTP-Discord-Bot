import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import { PrismaClient, Prisma } from "@prisma/client";

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('player')
        .setDescription('Replies with information about the searched for player')
        .addStringOption(option =>
            option.setName('team')
            .setDescription('Search for a team')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('fname')
            .setDescription('The players first name')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('lname')
            .setDescription('The players last name')
            .setRequired(true)),
    run: async (client, interaction) => {
        try {
            await interaction.deferReply();
            const league_id = 200;
            const team_nickname = interaction.options.getString('team');
            const player_firstName = interaction.options.getString('fname');
            const player_lastName = interaction.options.getString('lname');
            const prisma = new PrismaClient();

            const dbPlayer:any = await prisma.players.findFirst({
                where: {
                  league_id: league_id,
                  team: {
                    nickname: team_nickname
                  },
                  first_name: player_firstName,
                  last_name: player_lastName
                },
                select: {
                  first_name: true,
                  last_name: true,
                  team: {
                    select: {
                      nickname: true
                    }
                  },
                  batting_stats: {
                    where: {
                      year: {
                        not: null // Only consider rows with non-null year
                      },
                      split_id: 1,
                    },
                    orderBy: {
                      year: 'desc' // Order by year in descending order
                    },
                    take: 1, // Take only the first result (most recent year)
                    select: {
                      year: true,
                      league_id: true,
                      ab: true,
                      h: true,
                      k: true,
                      pa: true,
                      g: true,
                      gs: true,
                      hr: true,
                      rbi: true,
                      bb: true,
                      war: true
                    }
                  },
                  pitching_stats: {
                    where: {
                      year: {
                        not: null // Only consider rows with non-null year
                      },
                      split_id: 1,
                    },
                    orderBy: {
                      year: 'desc' // Order by year in descending order
                    },
                    take: 1, // Take only the first result (most recent year)
                    select: {
                      year: true,
                      league_id: true,
                      ip: true,
                      w: true,
                      l: true,
                      s: true,
                      k: true,
                      bb: true,
                      war: true,
                    },
                  },
                  gamesAsWinningPitcher: {
                    select: {
                      game_id: true,
                      date: true,
                      homeTeam: {
                        select: {
                          nickname: true,
                        }
                      },
                      awayTeam: {
                        select: {
                          nickname: true
                        }
                      },
                      runs0: true,
                      runs1: true
                    }
                  }
                }
              });
              await prisma.$disconnect();
              let playerStats:any = []

              if(dbPlayer?.batting_stats[0]?.pa > 0) {
                playerStats.push(
                    {name:'Year', value: `${dbPlayer.batting_stats[0].year}`, inline: true},
                    {name:'AB', value: `${dbPlayer.batting_stats[0].ab}`, inline: true},
                    {name:'H', value: `${dbPlayer.batting_stats[0].h}`, inline: true},
                    {name:'K', value: `${dbPlayer.batting_stats[0].k}`, inline: true},
                    {name:'PA', value: `${dbPlayer.batting_stats[0].pa}`, inline: true},
                    {name:'G', value: `${dbPlayer.batting_stats[0].g}`, inline: true},
                    {name:'GS', value: `${dbPlayer.batting_stats[0].gs}`, inline: true},
                    {name:'HR', value: `${dbPlayer.batting_stats[0].hr}`, inline: true},
                    {name:'RBI', value: `${dbPlayer.batting_stats[0].rbi}`, inline: true},
                    {name:'BB', value: `${dbPlayer.batting_stats[0].bb}`, inline: true},
                    {name:'WAR', value: `${dbPlayer.batting_stats[0].war}`, inline: true}
                )
              }

              if(dbPlayer?.pitching_stats[0]?.ip > 0){
                console.log(dbPlayer.gamesAsWinningPitcher);
                playerStats.push(
                    {name:'Year', value: `${dbPlayer.pitching_stats[0].year}`, inline: true},
                    {name:'IP', value: `${dbPlayer.pitching_stats[0].ip}`, inline: true},
                    {name:'W', value: `${dbPlayer.pitching_stats[0].w}`, inline: true},
                    {name:'L', value: `${dbPlayer.pitching_stats[0].l}`, inline: true},
                    {name:'S', value: `${dbPlayer.pitching_stats[0].s}`, inline: true},
                    {name:'K', value: `${dbPlayer.pitching_stats[0].k}`, inline: true},
                    {name:'BB', value: `${dbPlayer.pitching_stats[0].bb}`, inline: true},
                    {name:'WAR', value: `${dbPlayer.pitching_stats[0].war}`, inline: true}
                )
              }

              const embed = new EmbedBuilder()
                .setTitle(`${dbPlayer?.first_name} ${dbPlayer?.last_name}`)
                .setDescription(`${dbPlayer?.team?.nickname}`)
                .setFields(playerStats)

            await interaction.editReply({embeds: [embed]})              
        } catch (err) {
            console.error(err)
            await interaction.editReply({content: 'Something went wrong, Simbot is sad.'})
        }
    }
})