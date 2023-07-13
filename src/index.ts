import { config } from "dotenv";
import ExtendedClient from "./class/ExtendedClient";
import { AppDataSource } from "./datasource";
import path from "path";
import readCSV from "./utilities/readCSV";
import { User } from "./entity/user";
import dayjs from "dayjs";
import { TextChannel } from "discord.js";
import { GameDate } from "./entity/gamedate";

config();

export const client = new ExtendedClient();

async function initialize() {

    await AppDataSource.initialize().then(() => console.log('The database has been initilalized.'));

    client.start();
    client.loadModules()
    client.deploy();

    setInterval(async () => {
        const leaguesPath = path.join(__dirname, "csv", "leagues.csv");
        const leagues:any = await readCSV(leaguesPath);
        const date = leagues[0].current_date;
        const gamedate = new Date(date)

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({id: 1});

        const dateRepo = AppDataSource.getRepository(GameDate);

        if(!await dateRepo.findOneBy({id: 1})) {
            const newDbDate = dateRepo.create({date:date});
            dateRepo.save(newDbDate);
        };

        const dbDate = await dateRepo.findOneByOrFail({id: 1});
        
        if(dbDate.date !== date) {
            dbDate.date = date;
            await dateRepo.save(dbDate);
            const users:User[] = await userRepo.find();
            users.map((user) => {
                user.gameDate = date;
                user.ready = false;
                userRepo.save(user);
            })
            console.log('New data found, users & date updated.')
            try {
                const guild = process.env.GUILDID;
                const channel = client.channels.cache.get(guild ?? '')
                await (channel as TextChannel).send(`@everyone A new sim has run, the current game date is ${dayjs(gamedate).format('dddd, MMMM D, YYYY')}`)
            } catch (err) {
                console.error(err)
            }
        } else {
            console.log('Checking for new data.')
        }
    }, 3 * 60 * 1000)
}

initialize();