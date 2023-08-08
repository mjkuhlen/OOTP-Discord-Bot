import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { client } from '../..';
import { PrismaClient } from '@prisma/client';

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('standings')
        .setDescription('Replies with the standings of the chosen division.')
        .addStringOption(option => 
            option
                .setName('league')
                .setDescription('Choose the League.')
                .setRequired(true)
                .addChoices(
                    { name: 'American League', value: '0'},
                    { name: 'National League', value: '1'},
                ))
        .addStringOption(option =>
            option
                .setName('division')
                .setDescription('Choose the Division.')
                .setRequired(true)
                .addChoices(
                    { name: 'East', value: '0' },
					{ name: 'Central', value: '1' },
					{ name: 'West', value: '2' },
                )),
    run: async (client, interaction) => {
		const prisma = new PrismaClient();
        try {
			const leagueValue = interaction.options.getString('league');
			const divisionValue = interaction.options.getString('division');
			const league_id = 200;

			//get the teams from sql that matches the league and division values
			const pTeams = await prisma.teams.findMany({
				where: {league_id: league_id, sub_league_id: Number(leagueValue), division_id: Number(divisionValue), allstar_team: 0},
				select: {
					team_id: true,
					nickname: true,
					team_record: {
						select: {
							g: true,
							w: true,
							l: true,
							gb: true,
							pos: true,
							pct: true,
							streak: true,
							magic_number: true
						}
					}
				},
				orderBy: {
					team_record: {
						pos: 'asc'
					}
				}
			});

			await prisma.$disconnect();

			//create the rows for the table
			const newTableRows: any = [];
			pTeams.forEach((team:any) => {
				const row = `${team.nickname.padEnd(10)} | ${team.team_record.g.toString().padEnd(5)} | ${team.team_record.w.toString().padEnd(4)} | ${team.team_record.l.toString().padEnd(6)} | ${team.team_record.gb.toString().padEnd(2)} | ${team.team_record.streak.toString().padEnd(6)} | ${team.team_record.magic_number.toString().padEnd(6)}`;
				newTableRows.push(row);
			});

			// Create the table header
			const tableHeader = 'Nickname   | Games | Wins | Losses | GB | Streak | Magic #\n-----------|-------|------|--------|----|--------|--------';

			// Combine the table header and rows to create the complete table string
  			const table = `\`\`\`\n${tableHeader}\n${newTableRows.join('\n')}\n\`\`\``;

			const replyContent = `
			${table}
			`;

			let leagueName = '';

			switch (leagueValue) {
			case '0':
				leagueName = 'American League';
				break;
			case '1':
				leagueName = 'National League';
				break;
			default:
				break;
			}

			let divisionName = '';

			switch (divisionValue) {
				  case '0':
				divisionName = 'East';
				break;
				  case '1':
				divisionName = 'Central';
				break;
				  case '2':
				divisionName = 'West';
				break;
				  default:
				// Handle the case when divisionValue doesn't match any of the specified cases
				break;
			}


			const embed = new EmbedBuilder()
				.setTitle(`${leagueName} ${divisionName} Standings`)
				.setDescription(replyContent)
				.setColor('#0099ff');

			await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('Error Occured:', err);
			await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
})