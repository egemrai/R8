/* eslint-disable @typescript-eslint/no-explicit-any */
import { elasticSearchClient } from "@/lib/elasticSearch"
import prisma from "@/lib/prisma"
import { ensureUsersIndex } from "@/elasticSearch/user/ensureİndex"

// tek offerı ESye kaydetmek için , worker offer.ts içinde kullanılıyor create ve edit kısmında
export async function indexJustOneOffer(doc: any) {
  try {
    const { _id: id, sellerId, ...docWithNo_id } = doc  // const id = doc._id ile aynı şey
    await elasticSearchClient.index({
      index: "offers",
      id: id.toString(),
      document: {
        ...docWithNo_id,  //document içinde ES id kabul etmediği için çıkardım
        sellerId: sellerId._id,
        sellerUsername: sellerId.username, // reindexToEs kısmında populate var diye böyle username alabildim
        // _id: id,
        // sellerId: String(docWithNo_id.sellerId),

      },
    })
  } catch (error) {
    console.error(error)
  }

}

//BULK INDEX USERS  KISMI
export async function getUsersData() {
  try {
    const users = await prisma.user.findMany(
      {
        include: {
          followers: true,
          following: true,
          posts: true
        },
      }
    )

    const editedUsersForElasticSearch = users.map((user: any) => {

      return (
        {
          id: user.id,
          username: user.username,
          image: user.image,
          followersCount: user.followers.length || 0,
          followingCount: user.following.length || 0,
          postsCount: user.posts.length || 0,
          emailVerified: user.emailVerified,
          role: user.role,
          createdAt: user.createdAt
        }
      )
    })

    return editedUsersForElasticSearch
  } catch (error) {
    console.error(error)
  }

}

function setUsersIndexBody(users: any) {
  try {
    const body = users.flatMap((user: any) => { // return içinde 2 object return edilmesi gerektiği için '[]' içine almak zorunda kaldım, eklediğim [] kaldırmak için de flatMap kullandım.
      const { id, ...userWithNoId } = user
      return (
        [{ index: { _index: "users", _id: String(id) } },
        {
          ...userWithNoId,  //document içinde ES id kabul etmediği için çıkardım
        }]
      )
    })

    return body
  } catch (error) {
    console.error(error)
  }
}


export async function indexUsersToElasticSearch() {
  try {
    const usersData = await getUsersData()
    if (!usersData) {
      throw new Error("No users data");
    }

    const body = setUsersIndexBody(usersData)

    await ensureUsersIndex()

    const results: any = []
    const failed: any = []
    let total: number = 0


    const chunk = 1000

    for (let i = 0; i < body.length; i += chunk) {
      const slicedBody = body.slice(i, i + chunk)

      const result = await elasticSearchClient.bulk({ body: slicedBody }) // bulk fonksiyonu için parametre adı "body" olmak zorundaymış, o yüzden body: slicedBody yaptım

      results.push(result)
      total += result.items.length
    }


    for (const result of results) {
      result.items.forEach((item: any) => {

        const op = item.index || item.create || item.update
        // item bunlardan biri olduğu için yukarıda op tanımladık, bulk index log çıktısında ayrıntılı anlarsın; masaüstü ssde var

        if (op?.error) {
          failed.push({
            id: op._id,
            error: op.error,
            status: op.status
          })
        }
      })
    }


    // console.log('users 100% successfully indexed to ES')
    // console.log('users indexed to ES with min 1 error(s)')
    console.log(`bulk index users-> total: ${total || '?'}, success: ${total - failed.length || '?'}, failed: ${failed.length || '?'}`)
    return { message: `bulk index users-> total: ${total || '?'}, success: ${total - failed.length || '?'}, failed: ${failed.length || '?'}` }
  } catch (error) {
    console.error(error)
  }


}