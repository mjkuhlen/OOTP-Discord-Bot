import { SlashCommandBuilder, EmbedBuilder} from 'discord.js';
import { client } from '../..';
import { AppDataSource } from '../../datasource';
import { User } from '../../entity/user';

export default new client.command({
    stucture: new SlashCommandBuilder()
        .setName('ready')
        .setDescription('Allows a user to update their ready status.')
        .addBooleanOption(option =>
            option
                .setName('ready')
                .setDescription('Are you ready or not?')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const userTarget = interaction.user.username;
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneByOrFail({username: userTarget});
        user.ready = !!interaction.options.getBoolean('ready');
        await userRepo.save(user);

        const embed = new EmbedBuilder()
            .setTitle('Ready!')
            .setDescription(`${userTarget} has updated their status for the next sim.`)
            .setColor('#0099ff')
        
        await interaction.reply({embeds: [embed]})
    }
})