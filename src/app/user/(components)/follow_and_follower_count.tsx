'use client'

import { Button } from "@/components/ui/button"
import React from "react"
import { toast } from "sonner"


interface FollowAndFollowerProps {
    user: any
    followersCount: number
    setFollowModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setFollowSwitch: React.Dispatch<React.SetStateAction<'following' | 'follower'>>
}

export function FollowAndFollower({ user, followersCount, setFollowModalOpen, setFollowSwitch }: FollowAndFollowerProps) {

    return (
        <>

            <div onClick={() => {
                setFollowModalOpen(true)
                setFollowSwitch('follower')
            }
            }
                className="flex flex-col items-center hover:cursor-pointer">
                <p className="overflow-hidden">
                    {followersCount}
                </p>
                <p className="overflow-hidden">
                    Follower
                </p>
            </div>
            <div onClick={() => {
                setFollowModalOpen(true)
                setFollowSwitch('following')
            }}
                className="flex flex-col items-center hover:cursor-pointer">
                <p className="overflow-hidden">
                    {user.following.length}
                </p>
                <p className="overflow-hidden">
                    Following
                </p>
            </div>


            <Button className=" ml-auto bg-white text-black">
                ...
            </Button>
        </>
    )
}