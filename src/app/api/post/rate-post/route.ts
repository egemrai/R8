import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const ratingSchema = z.object({
    postId: z.string().min(1),
    ratings: z.array(
        z.object({
            imageId: z.string().min(1),
            score: z.number().int().min(1).max(8),
        })
    ).min(1).max(3),
})

// İstemciye döndürülecek hatanın HTTP durumunu taşır.
class RequestError extends Error {
    constructor(
        message: string,
        readonly status: number
    ) {
        super(message)
    }
}

export async function POST(req: Request) {
    try {
        // Oy veren kullanıcı istemciden değil, oturumdan belirlenir.
        const session = await auth.api.getSession({
            headers: req.headers,
        })

        if (!session) {
            return Response.json(
                { error: "Sign in to rate photos." },
                { status: 401 }
            )
        }

        let body: unknown

        try {
            body = await req.json()
        } catch {
            return Response.json(
                { error: "Request body must be valid JSON." },
                { status: 400 }
            )
        }

        const parsed = ratingSchema.safeParse(body)

        if (!parsed.success) {
            return Response.json(
                {
                    error: "Invalid ratings.",
                    details: z.treeifyError(parsed.error),
                },
                { status: 400 }
            )
        }

        const { postId, ratings } = parsed.data
        const userId = session.user.id

        // Aynı fotoğrafın istekte birden fazla kez gönderilmesini engeller.
        const imageIds = new Set(ratings.map(rating => rating.imageId))

        if (imageIds.size !== ratings.length) {
            return Response.json(
                { error: "Each photo can appear only once." },
                { status: 400 }
            )
        }

        await prisma.$transaction(async tx => {
            // Gizli gönderiye yalnızca sahibinin erişmesine izin verir.
            const post = await tx.post.findFirst({
                where: {
                    id: postId,
                    OR: [
                        { visibility: "public" },
                        { authorId: userId },
                    ],
                },
                select: {
                    images: {
                        select: {
                            id: true,
                        },
                    },
                },
            })

            if (!post) {
                throw new RequestError("Post not found.", 404)
            }

            // Gönderinin bütün fotoğraflarına tam birer oy gönderilmelidir.
            const matchesPost =
                post.images.length === ratings.length &&
                post.images.every(image => imageIds.has(image.id))

            if (!matchesPost) {
                throw new RequestError(
                    "Submit one rating for every photo in this post.",
                    400
                )
            }

            for (const rating of ratings) {
                // Oy yoksa oluşturur; varsa aynı kaydı günceller.
                await tx.imageRating.upsert({
                    where: {
                        userId_imageId: {
                            userId,
                            imageId: rating.imageId,
                        },
                    },
                    create: {
                        userId,
                        imageId: rating.imageId,
                        score: rating.score,
                    },
                    update: {
                        score: rating.score,
                    },
                })
            }
        })

        return Response.json(
            { success: true },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof RequestError) {
            return Response.json(
                { error: error.message },
                { status: error.status }
            )
        }

        console.error("Failed to submit ratings:", error)

        return Response.json(
            { error: "Failed to submit ratings." },
            { status: 500 }
        )
    }
}