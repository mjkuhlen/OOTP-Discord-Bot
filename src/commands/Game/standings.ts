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

			//get the teams from sql that matches the league and division values
			const pTeams = await prisma.teams.findMany({
				where: {league_id: 200, sub_league_id: Number(leagueValue), division_id: Number(divisionValue), allstar_team: 0},
				select: {
					team_id: true,
					nickname: true
				}
			});

			//create a list of the team_ids
			const teamList:any = [];
			pTeams.map((team:any) => {
				teamList.push(team.team_id)
			})

			//use team_ids to query team records
			const pRecrods = await prisma.team_record.findMany({
				where: {
					team_id: { in: teamList}
				},
				select: {
					team_id: true,
					g: true,
					w: true,
					l: true,
					gb: true,
					pos: true,
				}
			});

			//merge the team and team_records data together
			const mData = pTeams.map((team:any) => {
				const teamRecord = pRecrods.find((record:any) => record.team_id === team.team_id);
				return { ...team, ...teamRecord}
			});

			//sort the data by the position column
			const sData = mData.sort((a:any, b:any) => a.pos - b.pos);

			//create the rows for the table
			const newTableRows: any = [];
			sData.forEach((team:any) => {
				const row = `${team.nickname.padEnd(10)} | ${team.g.toString().padEnd(5)} | ${team.w.toString().padEnd(4)} | ${team.l.toString().padEnd(6)} | ${team.gb.toString().padEnd(6)}`;
				newTableRows.push(row);
			});

			// Create the table header
			const tableHeader = 'Nickname   | Games | Wins | Losses | GB\n-----------|-------|------|--------|------';

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
		await prisma.$disconnect();
    }
})