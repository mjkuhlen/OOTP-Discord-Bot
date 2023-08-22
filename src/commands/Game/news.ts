import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import { AppDataSource } from "../../datasource";
import { GameDate } from "../../entity/gamedate";
import dayjs from "dayjs";
import { PrismaClient } from '@prisma/client';

export default new client.command({
    structure: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Replies with the latest league news.'),
    run: async (client, interaction) => {
        try {
            const prisma = new PrismaClient();

            const pNews = await prisma.messages.findMany({
                where: {
                    OR: [
                        {league_id_0: 200},
                        {league_id_1: 200}
                    ],
                },
                orderBy: {
                    date: 'desc'
                },
                take: 25
            });
            await prisma.$disconnect();
            const headlines:any = []
            pNews.map((headline: any) => 

                headlines.push(
                    {
                        name: `${dayjs(headline.date).format('MMMM D, YYYY')}`,
                        value: `${headline.subject}`
                    })
            )

            const embed = new EmbedBuilder()
                .setTitle('Here are the headlines from the last 7 days.')
                .setFields(headlines)
                .setColor('#0099ff');

            await prisma.$disconnect()
            await interaction.reply({embeds: [embed]})
        } catch (err) {
            console.error(err);
            await interaction.reply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
})