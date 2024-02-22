import { SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import { exec } from 'child_process';
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
            await interaction.deferReply({ephemeral: true});
            // Get list of SQL files in the directory
            const files = fs.readdirSync(sqlDir);
            // Iterate over each SQL file
            for (const file of files) {
                if (file.endsWith('.sql')) {
                    const filePath = `${sqlDir}/${file}`;
                    console.log(`Importing file: ${filePath}`);
                    // Execute mysql command to import SQL file asynchronously
                    try {
                        await new Promise<void>((resolve, reject) => {
                            exec(`mysql -u ${username} -p${password} ${database} < ${filePath}`, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`Error importing file: ${filePath}`, error);
                                    reject(error);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    } catch (error) {
                        console.error(`Error importing file: ${filePath}`, error);
                    }
                }
            }
            await interaction.editReply({content: `SQL Files have been updated`})
        } catch (err) {
            console.log(err)
            await interaction.editReply({content: 'Something went wrong, Simbot is sad.'})
        }
    }
})
