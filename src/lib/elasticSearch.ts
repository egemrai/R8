import { Client } from "@elastic/elasticsearch"


const node = process.env.ELASTICSEARCH_URL ?? "http://localhost:9200"

export const elasticSearchClient = new Client({
  node,
  // dev'de genelde gerekmez; prod'da https/auth gelince burada ayarlarsın
  // auth: { username: "elastic", password: "..." },
  // tls: { rejectUnauthorized: false },
})