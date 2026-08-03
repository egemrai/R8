import { getFollowsData, indexFollowsToElasticSearch } from "@/elasticSearch/follow/indexFollowsToElasticSearch";
import { indexUsersToElasticSearch } from "@/elasticSearch/user/indexUsersToElasticSearch";
import { addEmailJob } from "@/jobs/producers/email";
import { apiHandler } from "@/lib/api-handler"
import { auth } from "@/lib/auth";
import { elasticSearchClient } from "@/lib/elasticSearch";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {

    try {

        // const res = await getFollowsData()
        // const res = await indexFollows()


        const res = await elasticSearchClient.search({
            index: 'follows',
            size: 100
        })

        // const res = await elasticSearchClient.deleteByQuery({
        //     index: "users",
        //     query: {
        //         match_all: {},
        //     },
        // })


        return Response.json({
            res: res
        })
    } catch (error) {

    }
}