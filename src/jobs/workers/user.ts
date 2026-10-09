import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { indexJustOneUser } from "@/elasticSearch/user/indexUsersToElasticSearch";
import prisma from "@/lib/prisma";
import { elasticSearchClient } from "@/lib/elasticSearch";
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


new Worker(
    "user-index",  //queue ile aynı isim
    async (job) => {
        if (job.name === "index-user") {
            const userId = job.data
            await indexJustOneUser(job.data)

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    elasticSyncedAt: new Date()
                }
            })
        }
        else if (job.name === "sync-user-ES-to-DB") {
            const userIds = job.data

            await prisma.user.updateMany({
                where: {
                    id: {
                        in: userIds
                    }
                },
                data: {
                    elasticSyncedAt: new Date()
                }
            })
        }
        else if (job.name === "delete-unused-cloudinary-image") {
            const { publicId } = job.data

            const references = await prisma.user.count({
                where: { image: publicId },
            })

            // Hâlâ bir profil tarafından kullanılıyorsa silme.
            if (references > 0) return

            const result = await cloudinary.uploader.destroy(publicId, {
                invalidate: true,
            })

            if (result.result !== "ok" && result.result !== "not found") {
                throw new Error(`Cloudinary delete failed: ${result.result}`)
            }
        }
        else if (job.name === "delete-user-image-from-DB") {
            const { userId, publicId } = job.data

            await prisma.user.updateMany({
                where: {
                    id: userId,
                    image: publicId,
                },
                data: {
                    image: null,
                },
            })
        }


    },
    {
        connection: redis,
    }
)

new Worker(
    "follow",
    async (job) => {
        if (job.name === "index-follow") {

            const res = await elasticSearchClient.search({
                index: "follows",
                size: 1,
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    followerId: job.data.followerId
                                }
                            },
                            {
                                term: {
                                    followingId: job.data.followingId
                                }
                            }
                        ]
                    }
                }
            })

            const exists = res.hits.hits.length > 0

            if (exists) throw new Error('index-follow -> already following')


            const { id, ...followWithNoId } = job.data
            await elasticSearchClient.index({
                index: "follows",
                id: String(id),
                document: {
                    ...followWithNoId,

                },
            })
        }
        else if (job.name === "delete-follow") {
            const { followerId, followingId } = job.data

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
            if (res.failures?.length) {
                throw new Error(
                    `ES deleteByQuery failed: ${JSON.stringify(res.failures)}`
                )
            }
        }

    },
    {
        connection: redis,
    }
)