'use client'

import { CldImage } from "next-cloudinary"
import { Card, CardHeader } from "../ui/card"
import Image from "next/image"
import { EditedFollow } from "@/app/api/(elastic-search)/fetch-follow/route"
import { getProfileImageSource } from "@/utils/user-image-letter"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { followAction, isFollowingAction, unfollowAction } from "@/actions/follow"
import { toast } from "sonner"


interface FollowUserCardProps {
    selfProfile: boolean
    followType: 'following' | 'follower'
    follow: EditedFollow
    isFollowing: {
        isFollowing: boolean // follow-user-card için takip edilip edilmediği
        isFollowingError: boolean // follow-user-card için isFollowing sorgusu hata verirse 
    }
    setIsFollowings: React.Dispatch<React.SetStateAction<{
        isFollowing: boolean
        isFollowingError: boolean
    }[]>>
    setFollows: React.Dispatch<React.SetStateAction<EditedFollow[]>>
    index: number
    selfUsername: string

}

const FollowUserCard = ({ selfProfile, followType, follow, isFollowing, setIsFollowings, setFollows, index, selfUsername }: FollowUserCardProps) => {
    const [pending, setPending] = useState<boolean>(false)

    const handleFollowAction = async () => {
        try {
            if (pending) return
            setPending(true)

            if (selfProfile) {
                //kendi profilindeki followerlar bakarken follow seçeneğine gerek yok
            }
            else {
                setIsFollowings(prev =>
                    prev.map((item, i) =>
                        i === index
                            ? {
                                ...item,
                                isFollowing: true,
                            }
                            : item
                    )
                )
                if (followType === 'follower') {
                    await followAction(follow.followerId, follow.followerUsername, follow.followerImage ?? '')
                } else {
                    await followAction(follow.followingId, follow.followingUsername, follow.followingImage ?? '')
                }

                toast.success("Followed!")
            }
        } catch (error) {
            // Rollback
            setIsFollowings(prev =>
                prev.map((isFollowing, i) =>
                    i === index
                        ? {
                            ...isFollowing,
                            isFollowing: false,
                        }
                        : isFollowing
                )
            )

            toast.error("Failed to follow", { description: String(error) })
        } finally {
            setPending(false)
        }
    }

    const handleUnfollowAction = async () => {
        try {
            if (pending) return
            setPending(true)

            if (selfProfile) {
                //kendi profilinde followingler içinden unf yapma

                setFollows(prev => {
                    return (
                        prev.filter((_, i) =>
                            index !== i
                        )
                    )
                }

                )

            }
            else {
                setIsFollowings(prev =>
                    prev.map((isFollowing, i) =>
                        index === i ?
                            {
                                ...isFollowing,
                                isFollowing: false
                            }
                            : isFollowing
                    )
                )

            }
            await unfollowAction(followType === 'follower' ? follow.followerId : follow.followingId)
            toast.success("Unfollowed!")

        } catch (error) {
            if (selfProfile) {
                setFollows(prev => {
                    const newFollows = [...prev]
                    newFollows.splice(index, 0, follow!)
                    return newFollows
                })
            }
            else {
                setIsFollowings(prev =>
                    prev.map((isFollowing, i) =>
                        index === i ?
                            {
                                ...isFollowing,
                                isFollowing: true
                            }
                            : isFollowing
                    )
                )
            }

            toast.error("Failed to unfollow", { description: String(error) })
        } finally {
            setPending(false)
        }
    }



    return (

        <>
            {followType === 'following' ?

                selfProfile ? // following type & self profile
                    <div className="flex flex-row justify-start gap-2 items-center h-15 w-full border-2  border-gray-150 p-1 rounded-4xl">
                        {follow.followingImage ?
                            <CldImage
                                src={follow.followingImage}
                                width={50}
                                height={50}
                                alt="avatar"
                                className="rounded-full"
                                radius='max'
                            />
                            : follow.followingUsername ?
                                <Image
                                    src={getProfileImageSource(follow.followingUsername)}
                                    width={50}
                                    height={50}
                                    alt="avatar"
                                    className="rounded-full"
                                />
                                : <>
                                </>
                        }
                        <div className="flex flex-col flex-2" >
                            <p className="overflow-hidden">
                                {follow.followingUsername}
                            </p>
                            {/* <p className="overflow-hidden">
                                    {user.username}
                                </p> */}
                        </div>
                        <Button className="flex flex-2" >
                            Send message
                        </Button>
                        <DropdownMenu>

                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-2 rounded-md hover:bg-muted">
                                    <Menu className="h-5 w-5" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenu>



                                    <DropdownMenuItem onClick={handleUnfollowAction
                                    } asChild>
                                        <p>Unfollow</p>
                                    </DropdownMenuItem>

                                </DropdownMenu>

                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                    : // following type & random user
                    <div className="flex flex-row justify-start gap-2 items-center h-15 w-full border-2  border-gray-150 p-1 rounded-4xl">
                        {follow.followingImage ?
                            <CldImage
                                src={follow.followingImage}
                                width={50}
                                height={50}
                                alt="avatar"
                                className="rounded-full"
                                radius='max'
                            />
                            : follow.followingUsername ?
                                <Image
                                    src={getProfileImageSource(follow.followingUsername)}
                                    width={50}
                                    height={50}
                                    alt="avatar"
                                    className="rounded-full"
                                />
                                : <>
                                </>
                        }
                        <div className="flex flex-col flex-2" >
                            <p className="overflow-hidden">
                                {follow.followingUsername}
                            </p>
                            {/* <p className="overflow-hidden">
                                    {user.username}
                                </p> */}
                        </div>
                        <Button className="flex flex-2" >
                            Send message
                        </Button>
                        <Button className="flex justify-end" >
                            ...
                        </Button>

                    </div>

                : selfProfile ?  // follower type & self profile
                    <div className="flex flex-row justify-start gap-2 items-center h-15 w-full border-2  border-gray-150 p-1 rounded-4xl">
                        {follow.followerImage ?
                            <CldImage
                                src={follow.followerImage}
                                width={50}
                                height={50}
                                alt="avatar"
                                className="rounded-full"
                                radius='max'
                            />
                            : follow.followingUsername ?
                                <Image
                                    src={getProfileImageSource(follow.followerUsername)}
                                    width={50}
                                    height={50}
                                    alt="avatar"
                                    className="rounded-full"
                                />
                                : <>
                                </>
                        }
                        <div className="flex flex-col flex-2" >
                            <p className="overflow-hidden">
                                {follow.followerUsername}
                            </p>
                            {/* <p className="overflow-hidden">
                                    {user.username}
                                </p> */}
                        </div>
                        <Button className="flex flex-2" >
                            Send message
                        </Button>

                        <DropdownMenu>

                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-2 rounded-md hover:bg-muted">
                                    <Menu className="h-5 w-5" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenu>



                                    <DropdownMenuItem onClick={() => console.log('ege')
                                    } asChild>
                                        <p>ege</p>
                                    </DropdownMenuItem>

                                </DropdownMenu>

                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                    :  // follower type & random user
                    <div className="flex flex-row justify-start gap-2 items-center h-15 w-full border-2  border-gray-150 p-1 rounded-4xl">
                        {follow.followerImage ?
                            <CldImage
                                src={follow.followerImage}
                                width={50}
                                height={50}
                                alt="avatar"
                                className="rounded-full"
                                radius='max'
                            />
                            : follow.followingUsername ?
                                <Image
                                    src={getProfileImageSource(follow.followerUsername)}
                                    width={50}
                                    height={50}
                                    alt="avatar"
                                    className="rounded-full"
                                />
                                : <>
                                </>
                        }
                        <div className="flex flex-col flex-2" >
                            <p className="overflow-hidden">
                                {follow.followerUsername}
                            </p>
                            {/* <p className="overflow-hidden">
                                    {user.username}
                                </p> */}
                        </div>
                        {isFollowing ?
                            !isFollowing.isFollowingError && !(String(selfUsername) === String(follow.followerUsername)) &&
                            (isFollowing.isFollowing ?
                                <Button onClick={handleUnfollowAction}
                                    disabled={pending} className="flex flex-2 text-white bg-black" >
                                    {`Following`}
                                </Button>
                                :
                                <Button onClick={handleFollowAction}
                                    disabled={pending} className="flex flex-2 bg-blue-500 text-white" >
                                    {`Follow`}
                                </Button>)
                            :
                            <Button className="flex flex-2 bg-blue-500 text-white" >
                                {`Loading`}
                            </Button>
                        }





                    </div>
            }
        </>
    )
}


export default FollowUserCard