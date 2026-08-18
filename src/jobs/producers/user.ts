import { userIndexQueue } from "@/jobs/queues/user-index";

//signup sonrası ES'ye kayıt, auth create after içinde
export async function indexUserJob(userId: string) {
    await userIndexQueue.add("index-user", userId, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    })
}

//ESye kaydedilen userların DB user tableda elasticSyncedAt date'ini oluşturma
export async function setElasticSearchSyncAtUserDB(userId: string) {
    await userIndexQueue.add("sync-user-ES-to-DB", userId, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    })
}