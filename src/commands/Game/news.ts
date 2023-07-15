import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import readCSV from "../../utilities/readCSV";
import path from "path";
import { AppDataSource } from "../../datasource";
import { GameDate } from "../../entity/gamedate";
import dayjs from "dayjs";

export default new client.command({
    structure: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Replies with the latest league news.'),
    run: async (client, interaction) => {
        try {
            const newsPath = path.join(__dirname, '..', '..', 'csv', 'messages.csv');
            const news:any = await readCSV(newsPath);
            const dateRepo = AppDataSource.getRepository(GameDate);
            const gameDate = await dateRepo.findOne({where: {id: 1}});
            const dateParts:any = gameDate?.date.split('-');

            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript
            const day = parseInt(dateParts[2]);

            const previousWeek = dayjs(gameDate?.date).subtract(7, 'days').format('YYYY-M-D');

            const filteredData = news.filter((message: any) => dayjs(message.date).format('YYYY-M-D') > previousWeek && message.league_id_0 === '200');

            const headlines = filteredData.map((headline: any) => 
                `${dayjs(headline.date).format('MMMM D YYYY')} - ${headline.subject}`
            ).join('\n')

            const embed = new EmbedBuilder()
                .setTitle('Here are the headlines from the last 7 days.')
                .setDescription(headlines)
                .setColor('#0099ff');

            await interaction.reply({embeds: [embed]})
        } catch (err) {
            console.error(err)
        }
    }
})