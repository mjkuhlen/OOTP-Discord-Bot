import { PrismaClient } from "@prisma/client";


export default async function hrLeaders(league_id: number, sub_league_id: number) {
    const prisma = new PrismaClient();
    const tLeaders = await prisma.players_career_batting_stats.findMany({
        where: {
            league_id: league_id,
            split_id: 1,
            year: 2028,
            player: {
                team: {
                    sub_league_id: sub_league_id
                }
            }
        },
        select: {
            player: {
                select: {
                    first_name: true,
                    last_name: true,
                    team: {
                        select: {
                            nickname: true
                        },
                    }
                }
            },
            h: true
        },
        orderBy: {
            h: 'desc'
        },
        take: 10
    });
    await prisma.$disconnect();

    return tLeaders;
}