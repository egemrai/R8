"use server"

import { indexUsersToElasticSearch } from "@/elasticSearch/user/indexUsersToElasticSearch"

export async function indexUsersToElasticSearchAction() {
    try {
        const res: Record<string, string> = await indexUsersToElasticSearch()

        return {
            success: true,
            message: res.message,
        }
    } catch (error) {
        return {
            success: false,
            message: "indexUsersToElasticSearchAction failed.",
        }
    }
}