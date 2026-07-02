"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type SignUpData = {
    email: string
    password: string
    username: string
    name?: string
}

export async function followAction(targetUserId: string) {
    try {

        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            return { success: false, message: "Unauthorized" }
        }

        const currentUserId = session.user.id

        if (currentUserId === targetUserId) {
            return { success: false, message: "You cannot follow yourself" }
        }

        const existing = await prisma.follow.findFirst({
            where: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        })

        if (existing) {
            return { success: false, message: "Already following" }
        }

        await prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        })

        return {
            success: true,
            message: "Followed"
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Follow failed"
        }
    }
}

export async function unfollowAction(targetUserId: string) {
    try {

        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            return { success: false, message: "Unauthorized" }
        }

        const currentUserId = session.user.id

        if (currentUserId === targetUserId) {
            return { success: false, message: "You cannot unfollow yourself" }
        }

        const existing = await prisma.follow.findFirst({
            where: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        })

        if (existing) {
            return { success: false, message: "Already following" }
        }

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        })

        return {
            success: true,
            message: "unFollowed"
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Unfollow failed"
        }
    }
}