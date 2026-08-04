'use client'

import { Container } from "@/components/egem-ui/Container"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CldImage } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { followAction, unfollowAction } from "../../actions/follow"

export default function UserProfilePage() {

    const router = useRouter()

    const { data: session, isPending } = authClient.useSession()

    const searchParams = useSearchParams()
    const username = searchParams.get("username")

    const [userDataIsLoading, setUserDataIsLoading] = useState<boolean>(true)
    const [userData, setUserData] = useState<any>()

    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)

    const [pending, setPending] = useState(false)

    const isFollowingCheck = (followersList: any[]) => {

        let count = 0

        for (const item of followersList) {
            if (item.followerId === session?.user.id) {
                count++
                if (count === 1) break
            }
        }
        if (count === 1) {
            setIsFollowing(true)
            return true
        } else {
            setIsFollowing(false) // buna gerek yok herhalde ilk state zaten false
            return false
        }
    }

    const getUserProfileData = async (username: string) => {
        try {
            setUserDataIsLoading(true)
            const res = await fetch(`/api/user/get-user-profile-data?username=${username}`)
            const jsonRes = await res.json()
            if (jsonRes.user === undefined || null) {
                return
            }
            console.log('jsonRes:', jsonRes.user)

            isFollowingCheck(jsonRes.user.followers)


            setUserData(jsonRes.user)
            setFollowersCount(jsonRes.user.followers.length)
        } catch (error) {
            console.error(error)
        } finally {
            setUserDataIsLoading(false)
        }

    }

    const handleFollow = async () => {
        try {
            if (pending) return
            setPending(true)
            setIsFollowing(true)
            setFollowersCount(prev => prev + 1)
            await followAction(userData.id)

        } catch {
            // Rollback
            setIsFollowing(false)
            setFollowersCount(prev => prev - 1)
        } finally {
            setPending(false)
        }
    }

    const handleUnfollow = async () => {
        try {
            if (pending) return
            setPending(true)
            setIsFollowing(false)
            setFollowersCount(prev => prev - 1)
            const unfreturn = await unfollowAction(userData.id)
            console.log('unfreturn:', unfreturn)
            router.refresh()  //bunu dene sayfa yenilemesi için 
        } catch {
            setIsFollowing(true)
            setFollowersCount(prev => prev + 1)
        } finally {
            setPending(false)
        }
    }

    useEffect(() => {
        if (username && !isPending) {
            getUserProfileData(username)
        }
    }, [isPending])


    return (
        <Container>
            {userDataIsLoading ? <h1>Loading...</h1>
                : <>
                    {userData ?
                        <>
                            <Card className="flex flex-col ">
                                <CardHeader className="flex flex-row gap-6 items-center ">
                                    {userData.image ?
                                        <>
                                            <CldImage
                                                src={userData.image}
                                                width={50}
                                                height={50}
                                                alt="avatar"
                                                className="rounded-full"
                                                radius='max'
                                            />
                                        </>
                                        : username ?
                                            <Image
                                                src={`/pp/${username.charAt(0).toLowerCase()}.png`}
                                                width={50}
                                                height={50}
                                                alt="avatar"
                                                className="rounded-full"
                                            />
                                            : <>
                                            </>
                                    }
                                    <div className="flex flex-col">
                                        <p className="overflow-hidden">
                                            {userData.name}
                                        </p>
                                        <p className="overflow-hidden">
                                            {userData.username}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <p className="overflow-hidden">
                                            {userData.posts.length}
                                        </p>
                                        <p className="overflow-hidden">
                                            Post
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <p className="overflow-hidden">
                                            {userData.following.length}
                                        </p>
                                        <p className="overflow-hidden">
                                            Following
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <p className="overflow-hidden">
                                            {followersCount}
                                        </p>
                                        <p className="overflow-hidden">
                                            Follower
                                        </p>
                                    </div>



                                    <Button className=" ml-auto bg-white text-black">
                                        ...
                                    </Button>

                                </CardHeader>
                                <CardContent>
                                    <div className="">    {/*profil açıklama kısmı burayı textarea gibi ayarla*/}
                                        resimsdflwölefamöwlefkf
                                        afawfe
                                        efawefw
                                    </div>

                                    {session === null ?
                                        <></>
                                        : session?.user.username === username ?
                                            <div className="flex flex-row">
                                                <Button>
                                                    Edit
                                                </Button>
                                            </div>
                                            :
                                            <div className="flex flex-row gap-2 h-8">

                                                <DropdownMenu >
                                                    <DropdownMenuTrigger asChild>
                                                        <button className={`h-full rounded-sm min-w-30 bg-black  text-white hover:text-amber-500 hover:cursor-pointer`}>
                                                            {isFollowing ? 'Following' : 'Follow'}
                                                        </button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem asChild>
                                                            {isFollowing
                                                                ?
                                                                <Button disabled={pending} onClick={handleUnfollow}>
                                                                    {'Unfollow'}
                                                                </Button>
                                                                :
                                                                <Button disabled={pending} onClick={handleFollow}>
                                                                    {"Follow"}
                                                                </Button>
                                                            }

                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem asChild>
                                                            <button className={`h-full rounded-sm min-w-30 bg-black  text-white hover:text-amber-500 hover:cursor-pointer`}>
                                                                {'empty'}
                                                            </button>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <Button onClick={() => console.log('session:', session)}
                                                    className="h-full min-w-30 rounded-sm">
                                                    Message
                                                </Button>
                                            </div>}

                                </CardContent>

                            </Card>

                        </>
                        : <h1>User Not found</h1>
                    }
                </>}


        </Container>

    )
}

