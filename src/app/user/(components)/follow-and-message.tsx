'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { unfollowAction, followAction } from "../actions.ts/follow"

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




    const handleFollow = async () => {
        try {
            if (pending) return
            setPending(true)
            setIsFollowing(true)
            setFollowersCount(prev => prev + 1)
            await followAction(user.id)

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
            const unfreturn = await unfollowAction(user.id)
            console.log('unfreturn:', unfreturn)
            // router.refresh()  //bunu dene sayfa yenilemesi için 
        } catch {
            setIsFollowing(true)
            setFollowersCount(prev => prev + 1)
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

