import { elasticSearchClient } from "@/lib/elasticSearch";


//FOLLOWİNF ID SABİT NEYİ TEST ETMEK İÇİN EKLEDİM HATIRLAMIYORUM
//random bi test herhalde kullanılmana endpoint
export async function GET(req: Request) {
    try {
        const res = await elasticSearchClient.search({
            index: "follows",
            size: 20,
            query: {
                term: {
                    followingId: "JKxwaMjUoVA4g4SyBIoiiX85GJbSlRMQ"
                }
            },
            sort: [
                { createdAt: "desc" },
                { followerId: "asc" }  //following search yaparken takip edilen kişi aynı olduğu için, createdAt aynı olursa ekstra sort ekledim takipçilerin idsi ile
            ]
        })


        return Response.json({
            res: res
        })
    } catch (error) {
        console.error(error)
    }


}