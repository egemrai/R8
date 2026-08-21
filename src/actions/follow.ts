"use server"

import { deleteFollowJob, indexFollowJob } from "@/jobs/producers/follow"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"


export async function followAction(targetUserId: string, targetUserUsername: string, targetUserImage: string) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const currentUserId = session.user.id

    if (currentUserId === targetUserId) {
        throw new Error('You cannot follow yourself')
    }

    const existing = await prisma.follow.findFirst({
        where: {
            followerId: currentUserId,
            followingId: targetUserId,
        },
    })

    if (existing) {
        throw new Error('Already following')
    }

    const createFollowRes = await prisma.follow.create({
        data: {
            followerId: currentUserId,
            followingId: targetUserId,
        },
    })


    //createFollowRes sağlamsa -> ES worker index-follow
    const editedFollowForElasticSearch =
    {
        id: createFollowRes.id,
        followerId: session.user.id,
        followingId: targetUserId,
        followerUsername: session.user.username,
        followingUsername: targetUserUsername,
        followerImage: session.user.image ?? null,
        followingImage: targetUserImage ?? null,
        createdAt: createFollowRes.createdAt
    }

    await indexFollowJob(editedFollowForElasticSearch)
}

export async function unfollowAction(targetUserId: string) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const currentUserId = session.user.id

    const existing = await prisma.follow.findFirst({
        where: {
            followerId: currentUserId,
            followingId: targetUserId,
        },
    })

    if (!existing) {
        throw new Error('Was not Following')
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        },
    })

    //deleteFollowRes sağlamsa -> ES worker delete-follow
    const editedUserIdsForElasticSearch = {
        followerId: currentUserId,
        followingId: targetUserId
    }
    await deleteFollowJob(editedUserIdsForElasticSearch)

}


export async function makeFollowerUnfollowAction(targetUserId: string) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const currentUserId = session.user.id

    const existing = await prisma.follow.findFirst({
        where: {
            followerId: targetUserId,
            followingId: currentUserId,
        },
    })

    if (!existing) {
        throw new Error('Was not Following')
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: targetUserId,
                followingId: currentUserId,
            },
        },
    })

    //deleteFollowRes sağlamsa -> ES worker delete-follow
    const editedUserIdsForElasticSearch = {
        followerId: currentUserId,
        followingId: targetUserId
    }
    await deleteFollowJob(editedUserIdsForElasticSearch)

}



export async function isFollowingAction(targetUserId: string) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const currentUserId = session.user.id

    const isFollowing = await prisma.follow.findFirst({
        where: {
            followerId: currentUserId,
            followingId: targetUserId,
        },
    })

    //isFollowing null ya da follow döndürüyor. !null -> true   !!null -> false
    return !!isFollowing


}




// const user2 = await prisma.user.findUnique({
//     where: {
//         username: "ege",
//     },
//     include: {
//         followers: {
//             include: {
//                 follower: {
//                     select: {
//                         username: true,
//                     },
//                 },
//             },
//         },
//     },
// })