import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import PostCard, { type PostCardData } from "./_components/post-card"

interface PostPageProps {
    searchParams: Promise<{
        postId?: string | string[]
    }>
}

export default async function PostPage({ searchParams }: PostPageProps) {
    const { postId } = await searchParams

    if (typeof postId !== "string" || !postId.trim()) {
        notFound()
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const userId = session?.user.id

    // Gizli gönderileri yalnızca sahibi görebilir.
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            OR: [
                { visibility: "public" },
                ...(userId ? [{ authorId: userId }] : []),
            ],
        },
        select: {
            id: true,
            content: true,
            direction: true,
            author: {
                select: {
                    username: true,
                },
            },
            mergedImage: {
                select: {
                    secureUrl: true,
                    width: true,
                    height: true,
                },
            },
            images: {
                orderBy: {
                    position: "asc",
                },
                select: {
                    id: true,
                    position: true,
                    secureUrl: true,
                    width: true,
                    height: true,
                    scoreColor: true,
                    scoreLocation: true,
                },
            },
        },
    })

    if (!post || !post.mergedImage || post.images.length === 0) {
        notFound()
    }

    const imageIds = post.images.map(image => image.id)

    // Bütün oyları çekmek yerine ortalamaları veritabanında hesaplar.
    const [averages, userRatings] = await Promise.all([
        prisma.imageRating.groupBy({
            by: ["imageId"],
            where: {
                imageId: { in: imageIds },
            },
            _avg: {
                score: true,
            },
        }),

        // Oturum yoksa kullanıcı oyları için sorgu yapılmaz.
        userId
            ? prisma.imageRating.findMany({
                where: {
                    userId,
                    imageId: { in: imageIds },
                },
                select: {
                    imageId: true,
                    score: true,
                },
            })
            : Promise.resolve([]),
    ])

    const averageByImageId = new Map(
        averages.map(rating => [
            rating.imageId,
            rating._avg.score,
        ])
    )

    const userScoreByImageId = new Map(
        userRatings.map(rating => [
            rating.imageId,
            rating.score,
        ])
    )

    const postData: PostCardData = {
        id: post.id,
        content: post.content,
        direction: post.direction,
        author: post.author,
        mergedImage: post.mergedImage,
        images: post.images.map(image => ({
            ...image,
            averageScore: averageByImageId.get(image.id) ?? null,
            userScore: userScoreByImageId.get(image.id) ?? null,
        })),
    }

    return (
        <main className="px-4 py-6">
            <PostCard
                key={post.id}
                post={postData}
                canRate={Boolean(userId)}
            />
        </main>
    )
}