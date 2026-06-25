import { apiHandler } from "@/lib/api-handler"
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    return apiHandler(async () => {

        const { searchParams } = new URL(req.url)
        const username = searchParams.get("username")

        if (!username) {
            throw Error('username missing')
        }
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        return Response.json({
            user
        })

    })

}