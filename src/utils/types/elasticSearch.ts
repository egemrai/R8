export interface EditedFollowForElasticSearch {
    id: string
    followerId: string
    followingId: string
    followerUsername: string
    followingUsername: string
    followerImage: string | null
    followingImage: string | null
    createdAt: Date
}

export interface DeleteFollowFromElasticSearchParams {
    followerId: string,
    followingId: string
}