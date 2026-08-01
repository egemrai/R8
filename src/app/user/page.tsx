
import { Container } from "@/components/egem-ui/Container"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { ProfileClient } from "./(components)/profile-Client"

export default async function UserProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ username?: string }>
}) {


    const session = await auth.api.getSession({
        headers: await headers(),
    })

    // const searchParams = useSearchParams()
    // const username = searchParams.get("username")
    const username = (await searchParams).username

    let user: any = null
    let count = 0
    let isFollowing = false

    const safeSession = session
        ? JSON.parse(JSON.stringify(session))
        : null

    const isFollowingCheck = () => {
        for (const item of user.followers) {
            if (item.followerId === session?.user.id) {
                count++
                if (count === 1) break
            }
        }
        if (count === 1) {
            return true
        } else {
            return false
        }
    }

    try {

        if (!username) throw Error('username missing')

        user = await prisma.user.findUnique({
            where: {
                username: username,
            }, include: {
                followers: {
                    include: {
                        follower: {
                            select: {
                                username: true,
                                image: true
                            }
                        }
                    }
                },
                following: true,
                posts: true,
            },
        })
        console.log('jsonRes:', user)


        if (!user) throw Error('user missing')


        console.log('session:', session)


        isFollowing = isFollowingCheck()

    } catch (error) {
        console.error(error)
    }


    return (
        <Container>
            {user ?
                <>
                    <ProfileClient
                        user={user}
                        username={username!}
                        session={session}
                        initialIsFollowing={isFollowing} />

                </>
                : <h1>User Not found</h1>
            }



        </Container>

    )
}

