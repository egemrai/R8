'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { unfollowAction, followAction } from "../../../actions/follow"
import { toast } from "sonner"

interface FollowAndMessageProps {
    user: any
    session: any
    username: string
    isFollowing: boolean
    setFollowersCount: React.Dispatch<React.SetStateAction<number>>
    pending: boolean
    setPending: React.Dispatch<React.SetStateAction<boolean>>
    setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>
}

export default function FollowAndMessage({ user, session, username, isFollowing, setFollowersCount, pending, setPending, setIsFollowing }: FollowAndMessageProps) {




    const handleFollowAction = async () => {
        try {
            if (pending) return
            setPending(true)
            setIsFollowing(true)
            setFollowersCount(prev => prev + 1)
            await followAction(user.id, user.username, user.image ?? '')
            toast.success("Followed!")
        } catch (error) {
            // Rollback
            setIsFollowing(false)
            setFollowersCount(prev => prev - 1)
            toast.error("Failed to follow", { description: String(error) })
        } finally {
            setPending(false)
        }
    }

    const handleUnfollowAction = async () => {
        try {
            if (pending) return
            setPending(true)
            setIsFollowing(false)
            setFollowersCount(prev => prev - 1)
            await unfollowAction(user.id)
            toast.success("Unfollowed!")

        } catch (error) {
            setIsFollowing(true)
            setFollowersCount(prev => prev + 1)
            toast.error("Failed to unfollow", { description: String(error) })
        } finally {
            setPending(false)
        }
    }

    return (
        <>
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
                                        <Button disabled={pending} onClick={handleUnfollowAction}>
                                            {'Unfollow'}
                                        </Button>
                                        :
                                        <Button disabled={pending} onClick={handleFollowAction}>
                                            {"Follow"}
                                        </Button>
                                    }

                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <button className={`h-full rounded-sm min-w-30 bg-black  text-white hover:text-amber-500 hover:cursor-pointer`}>
                                        {isFollowing + 'ege'}
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => console.log('session:', session)}
                            className="h-full min-w-30 rounded-sm">
                            Message
                        </Button>
                    </div>}
        </>

    )
}

