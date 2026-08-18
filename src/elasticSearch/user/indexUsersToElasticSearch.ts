/* eslint-disable @typescript-eslint/no-explicit-any */
import { elasticSearchClient } from "@/lib/elasticSearch"
import prisma from "@/lib/prisma"
import { ensureUsersIndex } from "@/elasticSearch/user/ensureİndex"
import { setElasticSearchSyncAtUserDB } from "@/jobs/producers/user"

export interface User {  //ayar çek
  id: string
  username: string
  image: string
  followersCount: number
  followingCount: number
  postsCount: number,
  emailVerified: boolean
  role: 'admin' | 'user'
  createdAt: Date
}

export interface ElasticSearchUser {
  id: string
  username: string
  image: string
  followersCount: number
  followingCount: number
  postsCount: number,
  emailVerified: boolean
  role: 'admin' | 'user'
  createdAt: Date
}

// tek userı ESye kaydetmek için , worker içinde kullanılıyor auth after signup
export async function indexJustOneUser(userId: string) {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      followers: true,
      following: true,
      posts: true
    },
  }
  )

  if (!user) throw new Error('indexJustOneUser no user')

  const editedUsersForElasticSearch = {
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

  const { id, ...userWithNoId } = editedUsersForElasticSearch
  await elasticSearchClient.index({
    index: "users",
    id: String(id),
    document: {
      ...userWithNoId,
    },
  })
}

//BULK INDEX USERS KISMI
export async function getUsersData() {

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
  const usersData: ElasticSearchUser[] = await getUsersData()
  if (!usersData) {
    throw new Error("No users data");
  }

  const body = setUsersIndexBody(usersData)

  await ensureUsersIndex()

  const results: any = []
  const failed: any = []
  const succeeded: any = []
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
      else {
        succeeded.push(
          op._id
        )
      }
    })
  }

  setElasticSearchSyncAtUserDB(succeeded)

  // console.log('succeeded:', succeeded)  
  // succeeded: [
  // 'Z5KJsXjXtsT7Kjacr4hOIMFIKpU098gR',
  // 'sTU45UBHNiTIEAv7JyWWuOsOrCWSuVry', ]

  return { message: `bulk index users-> total: ${total || '?'}, success: ${total - failed.length || '?'}, failed: ${failed.length || '?'}` }



}