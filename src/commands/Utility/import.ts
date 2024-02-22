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
            await interaction.deferReply();
            // Get list of SQL files in the directory
            const files = fs.readdirSync(sqlDir);
            // Prepare a list of SQL files to import
            const sqlFiles = files.filter(file => file.endsWith('.sql'));
            // Generate a single string containing paths to all SQL files
            const fileList = sqlFiles.map(file => `${sqlDir}/${file}`).join(' ');
            // Execute mysqlimport command to import SQL files in bulk
            exec(`mysqlimport -u ${username} -p${password} ${database} ${fileList}`, async (error, stdout, stderr) => {
                if (error) {
                    console.error('Error importing files:', error);
                    await interaction.editReply({content: 'Error importing files. Please check the logs for details.'});
                } else {
                    console.log('Successfully imported files:', fileList);
                    await interaction.editReply({content: 'The SQL DB has been updated.'});
                }
            });
        } catch (err) {
            console.error(err);
            await interaction.editReply({content: 'Something went wrong, Simbot is sad.'});
        }
    }
});
