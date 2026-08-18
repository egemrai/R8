import { elasticSearchClient } from "@/lib/elasticSearch";

// id arrayi kabul ediyor
export async function deleteUsersFromElasticSearch(userIds: string[]) {

    const res: any = await Promise.allSettled(userIds.map(async (userId: string) => {

        const deleteRes = await elasticSearchClient.delete(
            {
                index: "users",
                id: userId
            }
        )
        return deleteRes

    }))


    // console.log('silinen userlar array:', res)
    // 2 farklı userId ile silme işlemi res console log -> console-log-data içinde var, adı deleteUsersFromElasticSearch

    const failedDocs = res.filter((doc: any) => doc.status !== 'fulfilled').map((doc: any) => {
        const errorBody = JSON.parse(doc.reason.message)
        // console.log('errorBody:', errorBody)
        return { id: errorBody._id, result: errorBody.result }
    })

    if (failedDocs.length === 0) {
        return {
            success: true,
            message: 'All users successfully deleted from ES'
        }
    }
    else {
        console.log('ES delete users, failed ones:', failedDocs)
        return {
            success: false,
            message: failedDocs
        }
    }
}

export async function getAllUsersFromElasticSearch() {
    const res = await elasticSearchClient.search({
        index: "users",
        size: 10000,
        query: {
            match_all: {}
        }
    })

    return res
}