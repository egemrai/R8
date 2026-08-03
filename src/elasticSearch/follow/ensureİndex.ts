import { elasticSearchClient } from "@/lib/elasticSearch"

export async function ensureFollowsIndex() {
  try {
    const index = "follows"
    console.log('follows ensureListIndexe girdi')
    const exists = await elasticSearchClient.indices.exists({ index }) // indices --> Elasticsearch’te index’leri oluşturan, silen ve kontrol eden yönetim API'ı sanırım
    if (exists) return

    await elasticSearchClient.indices.create({
      index,
      mappings: {
        properties: {

          followerId: { type: "keyword" },
          followingId: { type: 'keyword' },

          followerUsername: {
            type: "text",
            analyzer: "standard",
            fields: {
              keyword: {
                type: "keyword"
              }
            }
          },
          followingUsername: {
            type: "text",
            analyzer: "standard",
            fields: {
              keyword: {
                type: "keyword"
              }
            }
          },

          followerImage: { type: "keyword" },
          followingImage: { type: "keyword" },

          createdAt: { type: "date" },
        },
      },
    })
  } catch (error: any) {
    if (error.meta?.body?.error?.type !== "resource_already_exists_exception") {
      throw error
    }
  }

}