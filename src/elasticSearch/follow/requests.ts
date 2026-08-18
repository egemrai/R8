import { elasticSearchClient } from "@/lib/elasticSearch";
import { DeleteFollowFromElasticSearchParams } from "@/utils/types/elasticSearch";


export interface DeleteFollowsFromElasticSearchParams {
    userId: string,
}
//user account silince ESden follow datasını silmek için
export async function deleteFollowsFromElasticSearch(data: DeleteFollowsFromElasticSearchParams) {

    const { userId } = data

    const [followerRes, followingRes] = await Promise.allSettled([elasticSearchClient.deleteByQuery({
        index: "follows",
        query: {
            term: {
                followerId: userId
            }
        }
    }),
    elasticSearchClient.deleteByQuery({
        index: "follows",
        query: {
            term: {
                followingId: userId
            }
        }
    })])

    // console.log('followerRes:', followerRes)
    // console.log('followingRes:', followingRes)

    //'fulfilled' yapılan işlem başarılı demekmiş, silerken 1 eleman hatalı olursa da 'fulfilled' dönüyormuş.
    if (followerRes.status === 'fulfilled' && followingRes.status === 'fulfilled') {
        const totalFailures = [...(followerRes.value.failures ?? []), ...(followingRes.value.failures ?? [])]
        if (totalFailures.length === 0) {
            return {
                success: true,
                message: 'All follows successfully deleted from ES'
            }
        }

    }
    else {
        return {
            success: false,
            message: 'Failed to delete user follows'
        }
    }
}


export async function deleteFollowFromElasticSearch(data: DeleteFollowFromElasticSearchParams) {
    const { followerId, followingId } = data

    const res = await elasticSearchClient.deleteByQuery({
        index: "follows",
        query: {
            bool: {
                must: [
                    { term: { followerId: followerId } },
                    { term: { followingId: followingId } }
                ]
            }
        }
    })

    if (!res.failures || !Array.isArray(res.failures)) {
        throw new Error('res değişmiş, failures array yok')
    }


    if (res.failures?.length > 0) {
        return {
            success: false,
            message: 'Failed to delete follow'
        }
    }
    else if (res.total === 0) {

        return {
            success: false,
            message: 'No follow found to delete.'
        }
    }
    else {
        return {
            success: true,
            message: 'WP!'
        }
    }
}

export async function getAllFollowsFromElasticSearch() {
    const res = await elasticSearchClient.search({
        index: "follows",
        size: 10000,
        query: {
            match_all: {}
        }
    })

    return res
}