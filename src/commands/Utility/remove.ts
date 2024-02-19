import { SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import { AppDataSource } from "../../datasource";
import { User } from "../../entity/user";

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a user from the DB')
        .addStringOption(option =>
            option.setName('user')
            .setDescription('Choose user to remove')
            .setRequired(true)),
    run: async (client, interaction) => {
        try {
            const user = interaction.options.getString('user') as string;
            const userRepo = await AppDataSource.getRepository(User);
            const dbuser = await userRepo.findOneOrFail({
                where: { username: user}
            });
            await userRepo.remove(dbuser);
            await interaction.reply({content: `Removed ${user} from the DB`, ephemeral: true})
        } catch (err) {
            console.log(err)
            await interaction.editReply({content: 'Something went wrong, Simbot is sad.'})
        }
    }
})