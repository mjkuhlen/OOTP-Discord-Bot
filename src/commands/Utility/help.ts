import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { client } from "../..";

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with a list of all the available commands'),
    run: async (client, interaction) => {
      try {
        const embed = new EmbedBuilder()
        .setTitle('Available Commands')
        .setDescription('ready - Lets the bot know you are ready for the next sim\ngamedate - To see the current game date\nteam - Shows information about the selected team.\nuploaded - Shows who is ready for the next sim\nstandings - Shows the selected division standings')
        .setColor('#0099ff');
  
      await interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({content: 'Something went wrong. Simbot is sad.'})
    }
    }
});