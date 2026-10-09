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

export async function deleteUnusedCloudinaryImage(publicId: string) {
    await userIndexQueue.add(
        "delete-unused-cloudinary-image",
        { publicId },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: 100,
            removeOnFail: 1000,
        }
    )
}

interface DeleteUserImageFromDBProps {
    userId: string
    publicId: string
}
//Kullanıcı PPsini sildikten sonra -> cloudinaryden silinip -> DB user.image silinirken hata verirse -> DB user.image var olmayan bir public_id içerir -> bunu engellemek için DB hata verirse queueya sokuyorum.
export async function deleteUserImageFromDB(data: DeleteUserImageFromDBProps) {
    await userIndexQueue.add("delete-user-image-from-DB", data, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    })
}