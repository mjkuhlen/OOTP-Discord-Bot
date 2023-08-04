import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { client } from "../..";
import readCSV from '../../utilities/readCSV'
import path from 'path'
import dayjs from "dayjs";
import { PrismaClient } from '@prisma/client';

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('gamedate')
        .setDescription('Replies with the current game date.'),
    run: async (client, interaction) => {
        try {
            const prisma = new PrismaClient();
            const league_id = 200
            const leagues = await prisma.leagues.findFirst({
                where: {
                    league_id: league_id
                }
            });
    
            const date = dayjs(leagues?.current_date).add(1, 'day');
            
            const embed = new EmbedBuilder()
                .setTitle('Current Game Date')
                .setDescription(`The current game date is: ${dayjs(date).format('MMMM D, YYYY')}`)
                .setColor('#0099ff');
    
            await prisma.$disconnect();
            await interaction.reply({ embeds: [embed] })
        } catch (err) {
            console.error(err);
            await interaction.reply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
});