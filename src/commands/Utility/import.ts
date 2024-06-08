import { SlashCommandBuilder } from "discord.js";
import { client } from "../..";
import { exec } from 'child_process';
import * as fs from 'fs';
import updateGameDateAndNotify from "../../utilities/updateGameDateAndNotify";

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('import')
        .setDescription('Imports new SQL files into the DB'),
    run: async (client, interaction) => {
        const sqlDir = '/sql_files';
        const username = process.env.DB_USER;
        const database = process.env.DB_NAME;
        const password = process.env.DB_PASSWORD;
        try {
            await interaction.deferReply();
            const startTime = Date.now(); // Record start time
            // Get list of SQL files in the directory
            const files = fs.readdirSync(sqlDir);
            // Array to store promises for each import task
            const importPromises = [];
            // Iterate over each SQL file
            for (const file of files) {
                if (file.endsWith('.sql')) {
                    const filePath = `${sqlDir}/${file}`;
                    console.log(`Queuing import for file: ${filePath}`);
                    // Execute mysql command to import SQL file asynchronously
                    const importPromise = new Promise<void>((resolve, reject) => {
                        exec(`mysql -h mysql -P 3306 -u ${username} -p${password} ${database} < ${filePath}`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error importing file: ${filePath}`, error);
                                reject(error);
                            } else {
                                console.log(`Successfully imported file: ${filePath}`);
                                resolve();
                            }
                        });
                    });
                    importPromises.push(importPromise);
                }
            }
            // Wait for all import tasks to complete
            await Promise.all(importPromises);
            let newDate
            try {
                newDate = await updateGameDateAndNotify();
                const endTime = Date.now(); // Record end time
                const duration = (endTime - startTime) / 1000; // Calculate duration in seconds
                let response
                if (newDate) {
                    response = `The SQL DB has been updated. Time taken: ${duration} seconds. The current game date is ${newDate}`
                } else {
                    response = `The SQL DB has been updated. Time taken: ${duration} seconds.`
                }
                await interaction.editReply({content: response});
            } catch (err) {
                console.error(err)
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply({content: 'Something went wrong, Simbot is sad.'});
        }
    }
});

