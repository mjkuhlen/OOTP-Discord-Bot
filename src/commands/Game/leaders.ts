import { EmbedBuilder, SlashCommandBuilder, codeBlock } from "discord.js";
import { client } from "../..";
import { PrismaClient } from "@prisma/client";

export default new client.command({
    structure: new SlashCommandBuilder()
    .setName('leaders')
    .setDescription('Replies with the league leaders for a selected category')
    .addStringOption(option =>
        option
            .setName('category')
            .setDescription('Choose the category')
            .setRequired(true)
            .addChoices(
                {name: 'HR', value: '8'},
                {name: 'AVG', value: '18'},
                {name: 'RBI', value: '10'},
                {name: 'Stolen Bases', value: '9'},
                {name: 'Batter WAR', value: '58'},
                {name: 'Pitching Wins', value: '29'},
                {name: 'ERA', value: '40'},
                {name: 'Saves', value: '32'},
                {name: 'Strikeouts', value: '38'},
                {name: 'Pitching WAR', value: '59'}
            ))
    .addStringOption(option =>
        option
            .setName('league')
            .setDescription('Choose the league')
            .setRequired(true)
            .addChoices(
                { name: 'American League', value: '0'},
                { name: 'National League', value: '1'},
            )),
    run: async (client, interaction) => {
        try {
            const prisma = new PrismaClient();
            const league_id = 200;
            const leagueValue = interaction.options.getString('league');
            const category = interaction.options.getString('category');
            const pLeaders = await prisma.players_league_leader.findMany({
                where: {
                    league_id: league_id,
                    category: Number(category),
                    sub_league_id: Number(leagueValue),
                    year: {
                        equals: await prisma.players_league_leader.aggregate({
                            where: {
                                league_id: league_id,
                                category: Number(category),
                                sub_league_id: Number(leagueValue)
                            },
                            _max: {
                                year: true
                            }
                        }).then(result => result._max.year)
                    }
                },
                select: {
                    year: true,
                    place: true,
                    amount: true,
                    player: {
                        select: {
                            first_name: true,
                            last_name: true,
                            team: {
                                select: {
                                    nickname: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    place: 'asc'
                }
            });
            await prisma.$disconnect();
            const tableRows: any = [];
            pLeaders.forEach((leader:any) => {
                const row = `${leader.place} - ${leader.player.first_name} ${leader.player.last_name} - ${leader?.player?.team?.nickname} - ${leader.amount}`;
                tableRows.push(row);
            });
            const table = codeBlock(tableRows.join('\n'));
            let embedTitle = '';
            let leagueTitle = '';
            switch(category) {
                case '8':
                    embedTitle = 'Leaders HR';
                    break;
                case '18':
                    embedTitle = 'Leaders AVG';
                    break;
                case '10':
                    embedTitle = 'Leaders RBI';
                    break;
                case '9':
                    embedTitle = 'Leaders Stolen Bases';
                    break;
                case '58':
                    embedTitle = 'Leaders Batting WAR';
                    break;
                case '59':
                    embedTitle = 'Leaders Pitching WAR';
                    break;
                case '29':
                    embedTitle = 'Leaders Wins';
                    break;
                case '40':
                    embedTitle = 'Leaders ERA';
                    break;
                case '32':
                    embedTitle = 'Leaders Saves';
                    break;
                case '38':
                    embedTitle = 'Leaders Strikeouts';
                    break;
            }
            switch (leagueValue) {
                case '0':
                    leagueTitle = 'American League';
                    break;
                case '1':
                    leagueTitle = 'National League';
                    break;
                default:
                    break;
                }
			const embed = new EmbedBuilder()
				.setTitle(`${leagueTitle} - ${embedTitle}`)
				.setDescription(table)
				.setColor('#0099ff');
            await interaction.reply({embeds: [embed]})
        } catch (err) {
            console.error('Error Occured:', err);
			await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
})