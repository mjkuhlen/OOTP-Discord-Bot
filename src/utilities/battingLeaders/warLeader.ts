import prisma from "../client";

export default async function hrLeaders(league_id: number, sub_league_id: number) {
    const tLeaders = await prisma.players_career_batting_stats.findMany({
        where: {
            league_id: league_id,
            split_id: 1,
            year: {
                equals: await prisma.players_career_batting_stats.aggregate({
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
            war: true
        },
        orderBy: {
            war: 'desc'
        },
        take: 10
    });

    return tLeaders;
}