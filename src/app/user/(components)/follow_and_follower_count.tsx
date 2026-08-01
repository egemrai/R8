'use client'

import { Button } from "@/components/ui/button"
import React from "react"
import { toast } from "sonner"


interface FollowAndFollowerProps {
    user: any
    followersCount: number
    setFollowModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setFollowSwitch: React.Dispatch<React.SetStateAction<'following' | 'followers'>>
}

export function FollowAndFollower({ user, followersCount, setFollowModalOpen, setFollowSwitch }: FollowAndFollowerProps) {

    return (
        <>
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
            <div onClick={() => {
                setFollowModalOpen(true)
                setFollowSwitch('followers')
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

            {/* <Dialog>
                <DialogTrigger asChild>
                    <div onClick={() => toast('yuh')}
                        className="flex flex-col items-center hover:cursor-pointer">
                        <p className="overflow-hidden">
                            {followersCount}
                        </p>
                        <p className="overflow-hidden">
                            Follower
                        </p>
                    </div>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>ege</DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog> */}

            <Button className=" ml-auto bg-white text-black">
                ...
            </Button>
        </>
    )
}