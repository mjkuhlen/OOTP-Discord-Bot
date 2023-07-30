import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { client } from '../..';
import readCSV from '../../utilities/readCSV';
import path from 'path';

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
        try {
			const teamsPath = path.join(__dirname, '..', '..', 'csv', 'teams.csv');
			const teamRecordPath = path.join(__dirname, '..', '..', 'csv', 'team_record.csv');
			const teams:any = await readCSV(teamsPath);
			const teamRecords:any = await readCSV(teamRecordPath);

			const mergedData = teams.map((team:any) => {
				const teamRecord = teamRecords.find((record:any) => record.team_id === team.team_id);
				return { ...team, ...teamRecord };
			});

			const filteredData = mergedData.filter((item:any) => item.league_id === '200' && item.sub_league_id === interaction.options.getString('league') && item.division_id === interaction.options.getString('division') && item.allstar_team !== '1');

			const sortedData = filteredData.sort((a:any, b:any) => a.pos - b.pos);

			const tableRows:any = [];
			// Iterate over the sortedData and add each row to the tableRows array
			sortedData.forEach((team:any) => {
				const row = `${team.nickname.padEnd(10)} | ${team.g.toString().padEnd(5)} | ${team.w.toString().padEnd(4)} | ${team.l.toString().padEnd(6)} | ${team.gb.toString().padEnd(6)}`;
				tableRows.push(row);
			});

			// Create the table header
			const tableHeader = 'Nickname   | Games | Wins | Losses | GB\n-----------|-------|------|--------|------';

			// Combine the table header and rows to create the complete table string
  			const table = `\`\`\`\n${tableHeader}\n${tableRows.join('\n')}\n\`\`\``;

			const replyContent = `
			${table}
			`;

			const leagueValue = interaction.options.getString('league');
			const divisionValue = interaction.options.getString('division');

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