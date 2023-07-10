import 'dotenv/config';
import { Client, REST, Routes } from 'discord.js';

const token = "process.env.TOKEN";
const id = "process.eng.CLIENTID";

const client: Client = new Client({
    intents: [
        'Guilds'
    ]
});

client.login(token);
