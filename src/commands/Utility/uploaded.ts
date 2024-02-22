import { SlashCommandBuilder, EmbedBuilder} from 'discord.js';
import { client } from '../..';
import { AppDataSource } from '../../datasource';
import { User } from '../../entity/user';

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('uploaded')
        .setDescription('Replies with registered players and their upload status.'),
    run: async (client, interaction) => {
        try {
            await interaction.deferReply();
            const userRepo = AppDataSource.getRepository(User);
            const users = await userRepo.find();
    
            const playersList = users
                .map(user => `**${user.username}**: ${user.ready}`)
                .join('\n');
    
            const embed = new EmbedBuilder()
                .setTitle('Uploaded!')
                .setDescription(playersList)
                .setColor('#0099ff')
            
            await interaction.editReply({embeds: [embed]})
        } catch (err) {
            console.error(err);
            await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
        }
    }
})