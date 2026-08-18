"use server"

import { indexFollowsToElasticSearch } from "@/elasticSearch/follow/indexFollowsToElasticSearch"
import { deleteFollowFromElasticSearch, deleteFollowsFromElasticSearch, DeleteFollowsFromElasticSearchParams, getAllFollowsFromElasticSearch } from "@/elasticSearch/follow/requests"
import { indexUsersToElasticSearch } from "@/elasticSearch/user/indexUsersToElasticSearch"
import { deleteUsersFromElasticSearch, getAllUsersFromElasticSearch } from "@/elasticSearch/user/requests"
import { DeleteFollowFromElasticSearchParams } from "@/utils/types/elasticSearch"

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

export async function indexFollowsToElasticSearchAction() {
    try {
        const res: Record<string, string> = await indexFollowsToElasticSearch()

        return {
            success: true,
            message: res.message,
        }
    } catch (error) {
        return {
            success: false,
            message: "indexFollowsToElasticSearchAction failed.",
        }
    }
}

//bunu başka yere taşıcam şimdilik datayı consoleda görmek amaç
export async function getAllUsersFromElasticSearchAction() {
    try {
        const res: any = await getAllUsersFromElasticSearch()

        return {

            res: res,
        }
    } catch (error) {
        return {
            success: false,
            message: "getAllUsersFromElasticSearchAction failed.",
        }
    }
}

//bunu başka yere taşıcam şimdilik datayı consoleda görmek amaç
export async function getAllFollowsFromElasticSearchAction() {
    try {
        const res: any = await getAllFollowsFromElasticSearch()

        return {

            res: res,
        }
    } catch (error) {
        return {
            success: false,
            message: "getAllFollowsFromElasticSearchAction failed.",
        }
    }
}

//array içinde userId ile çalışıyor
export async function deleteUsersFromElasticSearchAction(userIds: string) {
    try {
        // console.log('formData:', formData)
        // const userIds = formData.get("userIds") as string
        // console.log('userIds:', userIds)

        const editedUserIds = userIds.split(',').map(userId => {   // textarea içine id'leri yazıp araya virgün koyunca düz 1 tane string gibi döndürüyor, stringlerden oluşan array yapmak için stringi ',' ile ayırıp, map ile idlerden oluşan array elde ediyoruz. filter(Boolean) null, undefianed falan için . trim() empty space, newline, tab falan için
            const safeUserId = userId.trim()
            return safeUserId
        }).filter(Boolean)

        // console.log('editedUserIds:', editedUserIds)

        const res: any = await deleteUsersFromElasticSearch(editedUserIds)

        // console.log('delESRes:', res)
        return res

    } catch (error) {
        // return {
        //     success: false,
        //     message: "deleteUsersFromElasticSearchAction failed.",
        // }
    }
}

export async function deleteFollowFromElasticSearchAction(data: DeleteFollowFromElasticSearchParams) {
    const { followerId, followingId } = data
    if (!followerId || !followingId) {
        throw new Error(' deleteFollowFromElasticSearchAction missing followerId || followingId')
    }

    const res: any = await deleteFollowFromElasticSearch(data)

    return res
}

export async function deleteFollowsFromElasticSearchAction(data: DeleteFollowsFromElasticSearchParams) {
    const { userId } = data
    if (!userId) {
        throw new Error(' deleteFollowFromElasticSearchAction missing userId')
    }

    const res: any = await deleteFollowsFromElasticSearch(data)

    return res
}