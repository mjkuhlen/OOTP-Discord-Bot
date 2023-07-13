# OOTP-Discord-Bot
A discord bot that interacts with OOTP to display up-to-date game data in your discord channels.

# Installation
- Clone Repository
- Make sure you have [Node Installed](https://nodejs.org/en)
- In terminal and from the root folder of the project run ```npm install```
- Follow instructions at [Discord.js](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to create bot
- Create a .env (in the root folder of the project) with TOKEN, GUILDID, & CLIENTID.  clientId: Your application's client id ([Discord Developer Portal](https://discord.com/developers/applications) > "General Information" > application id), guildId: Your development server's id ([Enable developer mode](https://support.discord.com/hc/en-us/articles/206346498) > Right-click the server title > "Copy ID")
- From OOTP -> Commissioner Portal -> Automator Portal choose to export csv files with your league file.  You don't need to export every file, so edit that option to only export leagues, teams, and team_record.
- In terminal and from the root folder of the project run ```npm run start``` In the terminal you will see the sqlite db initialize, commands deploy and the bot startup.  Assuming no error the bot will appear in your discord channel.
- Create a 'csv' folder inside the 'dist' folder and copy the generated OOTP csv files into the folder.

Now that the bot has started and has access to league data you can begin using the slash commands in your discord channel. 

# First Steps
- Use the /register command to add the discord users to the sqlite DB.  We will use this database to track if the users have marked themselves ready (true) or not (false).  We will also use the 'gamedate' field (attached to every user) to keep track of the last sim date and if it's changed on the league.csv file.  If the date has changed the bot will @everyone that a sim has been run and post the current gamedate.
This will update the gamedate field for all users with the new information and reset their 'ready' status to false.

# Commands
- /help - Replies with a list of all of the available slash commands for the bot.
- /gamedate - Replies with the games current date, it will pull this information from the leagues.csv file
- /ready - Allows a registered user to indicate whether or note they are ready for the next sim to happen.  Includes true (ready) or false (not ready) options.
- /register - Option to select a user and create them in the sqlite db.  This datapoint is used in the /ready, /uploaded commands.
- /uploaded - Replies with a list of all the registered users and whether or not they are ready for the next sim.
- /standings - Replies with the current standings of the selected division.  Options include league and division.

# Notes
By default this bot is built to work with leagues based in the MLB with the 'normal' league and division settings.  IE: In the /standings command your options are the American and National League and then you can choose
between the East, Central and West divisions.  Modifying this would be fairly straight forward.  In the standings.ts file you would update the name and value of the leage and division options, the value can be found in the 
teams.csv and/or the team_record.csv files.  And to change the league you would change ```item.league_id === '200'``` the league id.  The MLB league id is '200', this value can be found in the leagues.csv file.

# Adding Slash Commands
Adding new slash commands isn't too complicated the base code for a new command is:
```typescript
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { client } from "../..";

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('help') //name of the new command
        .setDescription('Replies with a list of all the available commands'), //description of the command
    run: async (client, interaction) => {
		const embed = new EmbedBuilder()
			.setTitle('Available Commands')
			.setDescription('ready - Lets the bot know you are ready for the next sim\ngamedate - To see the current game date\nteam - Shows information about the selected team.\nuploaded - Shows who is ready for the next sim\nstandings - Shows the selected division standings')
			.setColor('#0099ff');

		await interaction.reply({ embeds: [embed] });
    }
});
```
I like to use the EmbedBuilder because it makes each post by the bot distict from every other user but if you'd like their post to look like every other comment you can remove the 'const embed' section and just use:
```typescript
await interaction.reply({content: 'Whatever you want the bot to say'})
```
More information about creating commands, options etc. can be found at [Discord.js](https://discordjs.guide/#before-you-begin)

