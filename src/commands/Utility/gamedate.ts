import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { client } from "../..";
import dayjs from "dayjs";
import { PrismaClient } from '@prisma/client';

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('gamedate')
        .setDescription('Replies with the current game date.'),
    run: async (client, interaction) => {
        const prisma = new PrismaClient();
        try {
            const league_id = 200
            const leagues = await prisma.leagues.findFirst({
                where: {
                    league_id: league_id
                }
            });
    
            const date: any = leagues?.current_date;
            const formatDate = date.toISOString().slice(0,19).replace("T", " ");
            
            const embed = new EmbedBuilder()
                .setTitle('Current Game Date')
                .setDescription(`The current game date is: ${dayjs(formatDate).format('MMMM D, YYYY')}`)
                .setColor('#0099ff');
    
            await interaction.reply({ embeds: [embed] })
        } catch (err) {
            console.error(err);
            await interaction.reply({content: 'Something went wrong. Simbot is sad.'})
        }
        await prisma.$disconnect();
    }
});