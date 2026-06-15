import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(req: Request) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const body = await req.json()

    const image = body.image

    const userId = session?.user.id

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            image,
        },
    })

    return Response.json({
        success: true,
    })
}