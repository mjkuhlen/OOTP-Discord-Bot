import { EmbedBuilder, SlashCommandBuilder, codeBlock } from "discord.js";
import { client } from "../..";
import dayjs from "dayjs";
import { PrismaClient } from "@prisma/client";

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
            await interaction.deferReply();
            const league_id = 200
            const prisma = new PrismaClient();
            const leagueDate = await prisma.leagues.findFirst({
                where: {
                    league_id: league_id
                }
            });
            const teams = await prisma.teams.findFirst({
                where: {
                    nickname: interaction.options.getString('name')
                },
                include: {
                    team_record: true
                }
            });

            const games = await prisma.games.findMany({
                where: {
                    OR: [
                        {
                            home_team: teams?.team_id
                        },
                        {
                            away_team: teams?.team_id
                        }
                    ],
                    AND: [
                        {
                            date: {
                                gte: dayjs(leagueDate?.current_date).subtract(7, 'days').toDate()
                            }
                        },
                        {
                            date: {
                                lt: dayjs(leagueDate?.current_date).toDate()
                            }
                        }
                    ]
                },
                select: {
                    date: true,
                    homeTeam: {
                        select: {
                            nickname: true,
                        }
                    },
                    awayTeam: {
                        select: {
                            nickname: true,
                        }
                    },
                    starter0Player: {
                        select: {
                            first_name: true,
                            last_name: true,
                            
                        }
                    },
                    starter1Player: {
                        select: {
                            first_name: true,
                            last_name: true,
                        }
                    },
                    winningPitcher: {
                        select: {
                            first_name: true,
                            last_name: true,
                            _count: {
                                select: {
                                    gamesAsWinningPitcher: true,
                                    gamesAsLosingPitcher: true
                                }
                            }
                        },
                    },
                    losingPitcher: {
                        select: {
                            first_name: true,
                            last_name: true,
                            _count: {
                                select: {
                                    gamesAsWinningPitcher: true,
                                    gamesAsLosingPitcher: true
                                }
                            }
                        },
                    },
                    savePitcher: {
                        select: {
                            first_name: true,
                            last_name: true
                        }
                    },
                    runs0: true,
                    runs1: true,
                    hits0: true,
                    hits1: true
                }
            });
            prisma.$disconnect();
            let headlines:any = [];
            games.map((headline: any) => {
                headlines.push(
                    {
                        name: `${dayjs(headline.date).format('MMMM D, YYYY')}: ${headline.awayTeam.nickname} ${headline.runs0} @ ${headline.homeTeam.nickname} ${headline.runs1}`,
                        value: `(W) ${headline.winningPitcher.first_name} ${headline.winningPitcher.last_name} (${headline.winningPitcher?._count.gamesAsWinningPitcher} - ${headline.winningPitcher?._count.gamesAsLosingPitcher})
                        (L) ${headline.losingPitcher.first_name} ${headline.losingPitcher.last_name} (${headline.losingPitcher?._count.gamesAsWinningPitcher} - ${headline.losingPitcher?._count.gamesAsLosingPitcher})`
                    }
                )
            })

            const embed = new EmbedBuilder()
                .setTitle(`${teams?.nickname} news from the last week`)
                .setDescription(`The ${teams?.nickname} have ${teams?.team_record?.w} wins and ${teams?.team_record?.l} losses, that's a winning percentage of ${teams?.team_record?.pct}.`)
                .setFields(headlines)
                .setColor('#0099ff');

            await interaction.editReply({ embeds: [embed] })
        } catch (err) {
            console.error(err);
            await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
})