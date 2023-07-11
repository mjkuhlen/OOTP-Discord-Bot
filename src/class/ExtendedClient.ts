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

    public async start() {
        await this.login(process.env.TOKEN);
    }
};