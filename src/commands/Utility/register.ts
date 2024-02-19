import { SlashCommandBuilder } from 'discord.js';
import { AppDataSource } from '../../datasource';
import { User } from '../../entity/user';
import { client } from '../..';

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Creates a user in the DB, for tracking ready status')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Select User to add to DB')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        try {
            const user = interaction.options.getUser('target');
            const userRepo = await AppDataSource.getRepository(User);
            const newUser = await userRepo.create({
                username: user?.username
            })
            await userRepo.save(newUser)
    
            await interaction.reply({content: `Added ${user?.username} to the DB.`, ephemeral: true});
        } catch (err) {
            console.error(err);
            await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
        }
    },
});
