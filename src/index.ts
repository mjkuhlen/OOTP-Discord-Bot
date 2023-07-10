import { config } from "dotenv";
import ExtendedClient from "./class/ExtendedClient";
import { AppDataSource } from "./datasource";

config();

export const client = new ExtendedClient();

async function initialize() {

    await AppDataSource.initialize().then(() => console.log('The database has been initilalized.'));

    client.start();
    client.loadModules()
    client.deploy();
}

initialize();