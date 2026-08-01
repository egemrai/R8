import { indexUsers } from "@/elasticSearch/user/indexDoc";
import { addEmailJob } from "@/jobs/producers/email";
import { apiHandler } from "@/lib/api-handler"
import { auth } from "@/lib/auth";
import { elasticSearchClient } from "@/lib/elasticSearch";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {



    try {
        const res = await elasticSearchClient.search({
            index: 'users',
            size: 100
        })


        return Response.json({
            res: res
        })
    } catch (error) {

    }



}