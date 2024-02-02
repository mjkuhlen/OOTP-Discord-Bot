import { config } from "dotenv";
import ExtendedClient from "./class/ExtendedClient";
import { AppDataSource } from "./datasource";
import path from "path";
import readCSV from "./utilities/readCSV";
import { User } from "./entity/user";
import dayjs from "dayjs";
import { TextChannel } from "discord.js";
import { GameDate } from "./entity/gamedate";
import { PrismaClient } from '@prisma/client';

config();

export const client = new ExtendedClient();

async function initialize() {

    await AppDataSource.initialize().then(() => console.log('The database has been initilalized.'));

    client.start();
    client.loadModules()
    client.deploy();

    setInterval(async () => {
        try {
            const prisma = new PrismaClient();
            const league_id = 200
            const leagues = await prisma.leagues.findFirst({
                where: {
                    league_id: league_id
                }
            });
            prisma.$disconnect();
            const date: any = leagues?.current_date;
            const formatDate = date.toISOString().slice(0,19).replace("T", " ");
    
            const gamedate = dayjs(formatDate).format('MMMM D YYYY');
    
            const userRepo = AppDataSource.getRepository(User);
    
            const dateRepo = AppDataSource.getRepository(GameDate);
            const checkDB = await dateRepo.findOneBy({id: 1})
    
            if(checkDB == null) {
                const newDbDate = await dateRepo.create({date:date});
                await dateRepo.save(newDbDate);
            };
    
            const dbDate = await dateRepo.findOneByOrFail({id: 1});
            const checkDate = dayjs(dbDate.date).format('MMMM D YYYY');
    
            console.log(`dbDate - ${dbDate.date}`)
            console.log(`gameDate - ${gamedate}`)
            
            if(checkDate !== gamedate) {
                dbDate.date = dayjs(gamedate).toDate();
                await dateRepo.save(dbDate);
                const users:User[] = await userRepo.find();
                users.map((user) => {
                    user.gameDate = dayjs(gamedate).toDate();
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
        } catch (err) {
            console.log(err)
        }
    }, 60 * 1000)
}

initialize();