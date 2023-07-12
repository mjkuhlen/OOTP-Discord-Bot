import { Client, Collection, REST, Routes } from "discord.js";
import { Command } from "../types";
import { readdirSync } from 'node:fs';
import "dotenv"

export default class extends Client {
    public commands: Collection<string, Command>  = new Collection();
    public commandsArray: Command['structure'][] = [];

    constructor() {
        super({
            intents: [
                'Guilds'
            ]
        });
    };

    public loadModules() {
        //Commands
        for (const dir of readdirSync('./dist/commands/')) {
            for (const file of readdirSync('./dist/commands/' + dir + '/')) {
                const module: Command = require('../commands/' + dir + '/' + file).default;

                this.commands.set(module.structure.name, module);
                this.commandsArray.push(module.structure);

                console.log('Loaded new command: ' + file);
            }
        };

        //Events
        for (const dir of readdirSync('./dist/events/')) {
            for (const file of readdirSync('./dist/events/' + dir + '/')) {
                require('../events/' + dir + '/' + file);

                console.log('Loaded new event: ' + file);
            }
        };
    };

    public command = class {
        public structure: Command['structure'];
        public run: Command['run'];

        constructor(data: Command) {
            this.structure = data.structure;
            this.run = data.run;
        }
    }

    public async deploy() {
        const rest = new REST().setToken(process.env.TOKEN ?? '');

        try {
            console.log('Loading application commands...')
            await rest.put(Routes.applicationCommands(process.env.CLIENTID ?? ''), {
                body: this.commandsArray
            });
            console.log('Finished loading application commands.')
        } catch (err) {
            console.error(err);
        };
    };

    public async delete() {
        const rest = new REST().setToken(process.env.TOKEN ?? '');
        const clientId = process.env.CLIENTID ?? '';
        const guildId = process.env.GUILDID ?? '';
        const commandId = '1128380468715343913'
        try {
            console.log('Removing Guild Command...')
            await rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId))
                .then(() => console.log('Successfully deleted command'));
        } catch (err) {
            console.error(err)
        }

        try {
            console.log('Removing Global Command...')
            await rest.delete(Routes.applicationCommand(clientId, commandId))
                .then(() => console.log('Global Command Removed'));
        } catch (err) {
            console.log(err)
        }
    }

    public async start() {
        await this.login(process.env.TOKEN);
    }
};