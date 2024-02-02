import { client } from "../..";
import "dotenv"

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;
    
    try {
        command?.run(client, interaction);
    } catch (err) {
        console.error(err);
    };
});

client.on('messageCreate', (message) => {
    if (message.mentions.members?.has(client.user!.username)) {
        message.channel.send('Hi there!')
    }
})