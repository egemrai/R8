import { apiHandler } from "@/lib/api-handler"
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {
    return apiHandler(async () => {

        const session = await auth.api.getSession({
            headers: await headers(),
        })

        const followerId = session?.user.id || ''

        const { searchParams } = new URL(req.url)
        const username = searchParams.get("username")

        if (!username) {
            throw Error('username missing')
        }
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            }, include: {
                followers: true,
                following: true,
                posts: true,
            },
        });

        return Response.json({
            user
        })

    })

}