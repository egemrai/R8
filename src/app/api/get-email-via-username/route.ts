import prisma from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export async function POST(req: Request) {
    return apiHandler(async () => {
        const { username } = await req.json()

        const user = await prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                email: true,
            },
        })

        if (!user) {
            return Response.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        return Response.json({
            email: user.email,
        })

    })

}