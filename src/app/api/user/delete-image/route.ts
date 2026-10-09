import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { v2 as cloudinary } from "cloudinary"
import prisma from "@/lib/prisma"
import { deleteUserImageFromDB } from "@/jobs/producers/user"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true },
    })

    if (!user) {
        return Response.json(
            { error: "User not found" },
            { status: 404 }
        )
    }

    if (!user.image) {
        return Response.json({ error: null },
            { status: 200 })
    }

    try {
        const result = await cloudinary.uploader.destroy(user.image, {
            invalidate: true,
        })

        if (result.result !== "ok" && result.result !== "not found") {
            return Response.json(
                { error: "Failed to delete image" },
                { status: 502 }
            )
        }
    } catch (error) {
        console.error("Cloudinary delete error:", error)

        return Response.json(
            { error: "Failed to delete image" },
            { status: 502 }
        )
    }

    try {
        await prisma.user.updateMany({
            where: {
                id: session.user.id,
                image: user.image,
            },
            data: {
                image: null,
            },
        })
    } catch (error) {

        try {
            await deleteUserImageFromDB({ userId: session.user.id, publicId: user.image })

            return Response.json(
                { error: null },
                { status: 202 }
            )
        } catch (error) {
            return Response.json(
                { error: "Failed to deleteUserImageFromDB" },
                { status: 500 }
            )
        }
    }


    return Response.json({ error: null },
        { status: 200 })
}
