import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { client } from "../..";
import readCSV from '../../utilities/readCSV'
import path from 'path'
import dayjs from "dayjs";

export default new client.command({
    stucture: new SlashCommandBuilder()
        .setName('gamedate')
        .setDescription('Replies with the current game date.'),
    run: async (client, interaction) => {
        const leaguesPath = path.join(__dirname, "..", "..", "csv", "leagues.csv");
        const leagues:any = await readCSV(leaguesPath);
        const date = new Date(leagues[0].current_date);
        
        const embed = new EmbedBuilder()
            .setTitle('Current Game Date')
            .setDescription(`The current game date is: ${dayjs(date).format('MMMM D, YYYY')}`)
            .setColor('#0099ff');
        
        await interaction.reply({ embeds: [embed]})
    }
});