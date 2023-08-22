import { PrismaClient } from "@prisma/client";


export default async function hrLeaders(league_id: number, sub_league_id: number) {
    const prisma = new PrismaClient();
    const tLeaders = await prisma.players_career_pitching_stats.findMany({
        where: {
            league_id: league_id,
            year: {
                equals: await prisma.players_career_pitching_stats.aggregate({
                    where: {
                        league_id: league_id,
                    },
                    _max: {
                        year: true
                    }
                }).then(result => result._max.year)
            },
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
            ip: true
        },
        orderBy: {
            ip: 'desc'
        },
        take: 10
    });
    await prisma.$disconnect();

    return tLeaders;
}