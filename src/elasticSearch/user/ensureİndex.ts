import { elasticSearchClient } from "@/lib/elasticSearch"

export async function ensureUsersIndex() {
  try {
    const index = "users"
    console.log('ensureListIndexe girdi')
    const exists = await elasticSearchClient.indices.exists({ index }) // indices --> Elasticsearch’te index’leri oluşturan, silen ve kontrol eden yönetim API'ı sanırım
    if (exists) return

    await elasticSearchClient.indices.create({
      index,
      mappings: {
        properties: {

          username: {
            type: "text",
            analyzer: "standard",
            fields: {
              keyword: {
                type: "keyword"
              }
            }
          },

          image: { type: "keyword" },

          followersCount: { type: "integer" },
          followingCount: { type: "integer" },
          postsCount: { type: "integer" },

          // price: { type: "scaled_float", scaling_factor: 100 }, // 9.99$yi 9.99 * 100 = 999 şeklinde saklıyor datada, intiger daha güvenli. scaling factor 100 -> 2 basamak decimal, 10 olsaydı 1 basamak

          emailVerified: { type: "boolean" },
          role: { type: "keyword" },

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