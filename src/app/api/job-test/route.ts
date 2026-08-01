import { addEmailJob } from "@/jobs/producers/email";
import { apiHandler } from "@/lib/api-handler"
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {

    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")

    console.log('job username:', username)

    await addEmailJob(username as string)

    return Response.json({
        success: true
    })
}