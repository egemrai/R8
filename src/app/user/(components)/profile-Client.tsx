'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState } from "react"
import { UserCldImage } from "./cld-image"
import Image from "next/image"
import FollowAndMessage from "./follow-and-message"
import { FollowAndFollower } from "./follow_and_follower_count"
import { FollowModal } from "./follow-modal"

interface ProfileClientProps {
    user: any
    username: string
    session: any
    initialIsFollowing: boolean
}

export function ProfileClient({
    user,
    session,
    initialIsFollowing,
    username
}: ProfileClientProps) {

    const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing)
    const [followersCount, setFollowersCount] = useState(user.followers.length)
    const [pending, setPending] = useState(false)

    const [followModalOpen, setFollowModalOpen] = useState(false) //modal
    const [followSwitch, setFollowSwitch] = useState<'following' | 'followers'>('following') //modal

    return (
        <Card className="flex flex-col ">
            <CardHeader className="flex flex-row gap-6 items-center ">
                {user.image ?
                    <UserCldImage
                        user={user}
                    />
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
                        {user.name}
                    </p>
                    <p className="overflow-hidden">
                        {user.username}
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <p className="overflow-hidden">
                        {user.posts.length}
                    </p>
                    <p className="overflow-hidden">
                        Post
                    </p>
                </div>
                <FollowAndFollower
                    user={user}
                    followersCount={followersCount}
                    setFollowModalOpen={setFollowModalOpen}
                    setFollowSwitch={setFollowSwitch}
                />

            </CardHeader>
            <CardContent>
                <div className="">    {/*profil açıklama kısmı burayı textarea gibi ayarla*/}
                    resimsdflwölefamöwlefkf
                    afawfe
                    efawefw
                </div>

                <FollowAndMessage
                    user={user}
                    session={session}
                    username={username!}
                    isFollowing={isFollowing}
                    pending={pending}
                    setPending={setPending}
                    setIsFollowing={setIsFollowing}
                    setFollowersCount={setFollowersCount}
                />

                <FollowModal
                    followModalOpen={followModalOpen}
                    setFollowModalOpen={setFollowModalOpen}
                    followSwitch={followSwitch}
                    setFollowSwitch={setFollowSwitch}
                />

            </CardContent>

        </Card>
    )
}