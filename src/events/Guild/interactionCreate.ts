import { client } from "../..";

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

client.on('messageCreate', async (messageCreate) => {
    if (messageCreate.mentions.members?.has(client.user!.username)) {
        messageCreate.channel.send('Hi there!')
    }
})