import 'dotenv/config'
import { Client, GatewayIntentBits } from "discord.js";
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';

const token = process.env.token;

console.log("OOTP-Simbot is starting...")

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

ready(client);
interactionCreate(client);

client.login(token);
