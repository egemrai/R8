/* eslint-disable @typescript-eslint/no-explicit-any */
import { elasticSearchClient } from "@/lib/elasticSearch"
import prisma from "@/lib/prisma"
import { ensureFollowsIndex } from "./ensureİndex"

// follow yapınca worker ile bu çalışcak
export async function indexJustOneFollow(doc: any) {
  try {
    const { _id: id, ...docWithNo_id } = doc  // const id = doc._id ile aynı şey
    await elasticSearchClient.index({
      index: "follows",
      id: String(id),
      document: {
        ...docWithNo_id,  //document içinde ES id kabul etmediği için çıkardım

      },
    })
  } catch (error) {
    console.error(error)
  }

}

//BULK INDEX FOLLOWS  KISMI


export async function getFollowsData() {
  try {
    const follows = await prisma.follow.findMany(
      {
        include: {
          follower: {
            select: {
              image: true,
              username: true,
            }
          },
          following: {
            select: {
              image: true,
              username: true,
            }
          }
        },
      }
    )

    const editedFollowsForElasticSearch = follows.map((follow: any) => {

      return (
        {
          id: follow.id,
          followerId: follow.followerId,
          followingId: follow.followingId,
          followerUsername: follow.follower.username,
          followingUsername: follow.following.username,
          followerImage: follow.follower.image,
          followingImage: follow.following.image,
          createdAt: follow.createdAt
        }
      )
    })

    return editedFollowsForElasticSearch
  } catch (error) {
    console.error(error)
  }

}

function setFollowsIndexBody(follows: any) {
  try {
    const body = follows.flatMap((follow: any) => {
      const { id, ...followWithNoId } = follow
      return (
        [{ index: { _index: "follows", _id: String(id) } },
        {
          ...followWithNoId,
        }]
      )
    })

    return body
  } catch (error) {
    console.error(error)
  }
}


export async function indexFollowsToElasticSearch() {
  const followsData = await getFollowsData()
  if (!followsData) {
    throw new Error("No follows data");
  }

  const body = setFollowsIndexBody(followsData)

  await ensureFollowsIndex()

  const results: any = []
  const failed: any = []
  let total: number = 0


  const chunk = 1000

  for (let i = 0; i < body.length; i += chunk) {
    const slicedBody = body.slice(i, i + chunk)

    const result = await elasticSearchClient.bulk({ body: slicedBody })

    results.push(result)
    total += result.items.length
  }


  for (const result of results) {
    result.items.forEach((item: any) => {

      const op = item.index || item.create || item.update

      if (op?.error) {
        failed.push({
          id: op._id,
          error: op.error,
          status: op.status
        })
      }
    })
  }

  return { message: `bulk index follows-> total: ${total || '?'}, success: ${total - failed.length || '?'}, failed: ${failed.length || '?'}` }
}