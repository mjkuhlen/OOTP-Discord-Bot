import { SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import readCSV from "../../utilities/readCSV";
import path from "path";
import { AppDataSource } from "../../datasource";
import { GameDate } from "../../entity/gamedate";
import dayjs from "dayjs";

async function processCSV(filePath: string) {
    try {
        const results:any = await readCSV(filePath);

        // Convert the date column to Date objects
        results.forEach((row: any) => {
            const dateString = row.date; // Assuming the date column is named "date"
            const dateParts = dateString.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript
            const day = parseInt(dateParts[2]);

            row.date = new Date(year, month, day);
        });

        // Process the modified results array with date columns as Date objects
        // ...
    } catch (error) {
        console.error('Error reading CSV:', error);
    }
}

export default new client.command({
    structure: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Replies with the latest league news.'),
    run: async (client, interaction) => {
        try {
            const newsPath = path.join(__dirname, '..', '..', 'csv', 'messages.csv');
            const news:any = readCSV(newsPath);
            const dateRepo = AppDataSource.getRepository(GameDate);
            const gameDate = await dateRepo.findOne({where: {id: 1}});
            const previousWeek = dayjs(gameDate?.date).subtract(7, 'days').format('YYYY-M-D');

            const filteredData = news.filter((message: any) => dayjs(message.date).format('YYYY-M-D') > previousWeek);

            console.log(filteredData)
        } catch (err) {
            console.error(err)
        }
    }
})