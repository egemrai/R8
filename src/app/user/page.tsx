'use client'

import { Container } from "@/components/egem-ui/Container"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CldImage } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function UserProfilePage() {

    const { data: session, isPending } = authClient.useSession()

    const searchParams = useSearchParams()
    const username = searchParams.get("username")

    const [userDataIsLoading, setUserDataIsLoading] = useState<boolean>(true)
    const [userData, setUserData] = useState<any>()




    const getUserProfileData = async (username: string) => {
        try {
            setUserDataIsLoading(true)
            const res = await fetch(`/api/user/get-user-profile-data?username=${username}`);
            const jsonRes = await res.json()
            console.log('jsonRes:', jsonRes.user)
            setUserData(jsonRes.user)
        } catch (error) {
            console.error(error)
        } finally {
            setUserDataIsLoading(false)
        }

    }

    useEffect(() => {
        if (username) {
            getUserProfileData(username)
        }
    }, [])


    return (
        <Container>
            {!userDataIsLoading && userData &&
                <>
                    <Card className="flex flex-col ">
                        <CardHeader className="flex flex-row gap-6 items-center ">
                            <CldImage
                                src={userData.image}
                                width={50}
                                height={50}
                                alt="avatar"
                                className="rounded-full"
                                radius='max'
                                loading="eager"
                            />
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
                                    {28 /*buraya user post count ekle*/}
                                </p>
                                <p className="overflow-hidden">
                                    Post
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="overflow-hidden">
                                    {28 /*buraya user following count ekle*/}
                                </p>
                                <p className="overflow-hidden">
                                    Following
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="overflow-hidden">
                                    {28 /*buraya user follower count ekle*/}
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
                                                    {'following'}
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem asChild>
                                                    <Link href="/profile">Profile</Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem asChild>
                                                    <Link href="/account/user-info">engelleme ekle</Link>
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

            }

        </Container>

    )
}

