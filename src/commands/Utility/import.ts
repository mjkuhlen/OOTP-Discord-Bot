import { SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import { execSync } from 'child_process';
import * as fs from 'fs';
import { config } from "dotenv";


export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('import')
        .setDescription('Imports new SQL files into the DB'),
    run: async (client, interaction) => {
        const sqlDir = '/home/kuhlen/sql_files';
        const username = process.env.DATABASE_USER;
        const database = process.env.DATABASE_NAME;
        const password = process.env.DATABASE_PASSWORD;
        try {
            // Get list of SQL files in the directory
            fs.readdir(sqlDir, (err, files) => {
                if (err) {
                console.error('Error reading directory:', err);
                return;
                }
            
                // Iterate over each SQL file
                files.forEach(file => {
                if (file.endsWith('.sql')) {
                    const filePath = `${sqlDir}/${file}`;
                    console.log(`Importing file: ${filePath}`);
            
                    // Execute mysql command to import SQL file
                    try {
                    execSync(`mysql -u ${username} -p${password} ${database} < ${filePath}`, { stdio: 'inherit' });
                    } catch (error) {
                    console.error(`Error importing file: ${filePath}`, error);
                    }
                }
                });
            });
            await interaction.reply({content: `SQL Files have been updated`, ephemeral: true})
        } catch (err) {
            console.log(err)
            await interaction.editReply({content: 'Something went wrong, Simbot is sad.'})
        }
    }
})