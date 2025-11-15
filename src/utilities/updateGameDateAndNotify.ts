import dayjs from 'dayjs';
import { AppDataSource } from '.././datasource';
import { User } from '../entity/user';
import { GameDate } from '../entity/gamedate';
import prisma from './client';

export default async function updateGameDateAndNotify() {
    try {
        const league_id = 203;
        const leagues = await prisma.leagues.findFirst({
            where: {
                league_id: league_id,
            },
        });
        const date: any = leagues?.current_date;
        const formatDate = date.toISOString().slice(0, 19).replace('T', ' ');

        const gamedate = dayjs(formatDate).format('MMMM D YYYY');

        const userRepo = AppDataSource.getRepository(User);

        const dateRepo = AppDataSource.getRepository(GameDate);
        let dbDate = await dateRepo.findOneBy({ id: 1 });

        if (!dbDate) {
            const newDbDate = dateRepo.create({ date: date });
            await dateRepo.save(newDbDate);
            dbDate = newDbDate;
        } else {
            dbDate = await dateRepo.findOneByOrFail({ id: 1 });
        }
        const checkDate = dayjs(dbDate.date).format('MMMM D YYYY');

        if (checkDate !== gamedate) {
            dbDate.date = dayjs(gamedate).toDate();
            await dateRepo.save(dbDate);
            const users: User[] = await userRepo.find();
            users.map((user) => {
                user.gameDate = dayjs(gamedate).toDate();
                user.ready = false;
                userRepo.save(user);
            });
            console.log(`New data found, user status reset & date changed to ${dayjs(gamedate).format('dddd, MMMM D, YYYY')}.`);
            return dayjs(gamedate).format('dddd, MMMM D, YYYY')
        } else {
            console.log("Gamedate hasn't updated, no changes to users or date.");
            return null
        }
        
    } catch (err) {
        console.log(err);
        return null
    }
}
