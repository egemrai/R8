import { elasticSearchClient } from "@/lib/elasticSearch"


interface Follow {
    createdAt: Date
    followerId: string
    followerImage: string
    followerUsername: string
    followingId: string
    followingImage: string
    followingUsername: string
}
export interface EditedFollow {
    createdAt: Date
    followerId: string
    followerImage: string
    followerUsername: string
    followingId: string
    followingImage: string
    followingUsername: string
    sort: string[] //bu string[] olmayabilir
    followType: string
    id: string
}

export async function POST(req: Request) {
    try {
        console.log(' post api geldi');

        const data = await req.json()

        const { searchInput, followType, userId, searchAfter } = data

        if (!['follower', 'following'].includes(followType)) throw new Error('fetch-follow -> wrong followType')
        if (!userId) throw new Error('fetch-follow -> userId missing')


        console.log(' searchInput:', searchInput)

        //followers'a tıklayınca -> ES içinde followingId ile aramak lazım o yüzden altta userIdType condition yerleri farklı
        const userIdType = followType === 'follower' ? 'followingId' : 'followerId'

        const usernameType = followType === 'follower' ? 'followerUsername' : 'followingUsername'


        const body: any = {
            index: "follows",
            // from: (page - 1) * limit,
            size: 2,
            // track_total_hits: true,
            sort: [
                { createdAt: "desc" },
                { followerId: "asc" }  //following search yaparken takip edilen kişi aynı olduğu için, createdAt aynı olursa ekstra sort ekledim takipçilerin idsi ile
            ] as any[],
            query: {
                bool: {
                    must: [] as any[],
                    filter: [] as any[]
                }
            },
            search_after: undefined

        }

        body.query.bool.filter.push({
            term: {
                [userIdType]: userId
            }
        })

        if (searchInput && searchInput.trim() !== '') {
            body.query.bool.must.push({
                wildcard: {
                    [usernameType]: {
                        value: `*${searchInput}*`
                    }
                },
            })
        }

        if (searchAfter) {
            body.search_after = searchAfter
        }

        const res = await elasticSearchClient.search<Follow>(body)

        // console.log('followRes:', res)

        const editedRes = res.hits.hits.map(follow => {
            return ({
                sort: follow.sort,
                id: follow._id,
                createdAt: follow._source?.createdAt,
                followerId: follow._source?.followerId,
                followerImage: follow._source?.followerImage,
                followerUsername: follow._source?.followerUsername,
                followingId: follow._source?.followingId,
                followingImage: follow._source?.followingImage,
                followingUsername: follow._source?.followingUsername,
                followType: followType
            })
        })


        return Response.json({
            follows: editedRes,
            searchAfter: editedRes.at(-1)?.sort ?? null,
            hasMore: editedRes.length === 2,
        })
    } catch (error) {
        console.error(error)
    }


}