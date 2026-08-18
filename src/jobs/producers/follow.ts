import { DeleteFollowFromElasticSearchParams, EditedFollowForElasticSearch } from "@/utils/types/elasticSearch";
import { followQueue } from "../queues/follow";



//follow sonrası ES'ye kayıt, 
export async function indexFollowJob(data: EditedFollowForElasticSearch) {
    await followQueue.add("index-follow", data, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    })
}

export async function deleteFollowJob(data: DeleteFollowFromElasticSearchParams) {
    await followQueue.add('delete-follow', data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    })

}