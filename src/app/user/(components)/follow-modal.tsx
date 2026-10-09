'use client'

import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import FollowUserCard from "@/components/profile/follow--user-card"
import { useSearchParams } from "next/navigation"
import { isFollowingAction } from "@/actions/follow"
import { EditedFollow } from "@/app/api/(elastic-search)/fetch-follow/route"


interface FollowModalProps {
    followModalOpen: boolean
    setFollowModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    followSwitch: 'following' | 'follower'
    setFollowSwitch: React.Dispatch<React.SetStateAction<'following' | 'follower'>>
    user: any
    session: any
}

interface IsFollowingsProps {
    isFollowing: boolean // follow-user-card için takip edilip edilmediği
    isFollowingError: boolean // follow-user-card için isFollowing sorgusu hata verirse 
}

export function FollowModal({ followModalOpen, setFollowModalOpen, followSwitch, setFollowSwitch, user, session }: FollowModalProps) {

    const searchParams = useSearchParams()
    const routeUsername = searchParams.get('username')

    //linkteki username ile session username aynı mı kontrol 
    const selfProfileCheck = session?.user.username === routeUsername

    const [follows, setFollows] = useState<EditedFollow[]>([])
    const [isFollowings, setIsFollowings] = useState<IsFollowingsProps[]>([])


    const [searchAfter, setSearchAfter] = useState<any[] | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(false)


    const form = useForm<Record<string, string>>({
        defaultValues: {
            searchInput: ''
        },
    })

    const searchInput = useWatch({
        control: form.control,
        name: "searchInput",
    })

    async function fetchUsers({
        reset = false,
    }: {
        reset?: boolean
    }) {

        if (loading) return
        if (!hasMore && !reset) return
        if (!user) return
        if (!followSwitch) return

        // console.log('fetchIsers çalıştı -> searchInput:', searchInput);


        setLoading(true)

        try {
            //searchAfter yerine başka isim bulamadım _ ekledim
            const searchAfter_ = reset ? undefined : searchAfter

            const followType = followSwitch === 'follower' ? 'follower' : 'following'

            // API / server action
            const res = await fetch("/api/fetch-follow", {
                method: "POST",
                body: JSON.stringify({
                    followType: followType,
                    searchInput: searchInput,
                    searchAfter: searchAfter_,
                    userId: user.id
                }),
            })

            const data = await res.json()

            // console.log('searchAfter:', data.searchAfter);
            // console.log('follows:', data.follows);
            // console.log('hasMore:', data.hasMore);


            if (reset) {
                setFollows(data.follows)
                await handleSetIsFollowings(data.follows, true)
            } else {
                setFollows(prev => [
                    ...prev,
                    ...data.follows,
                ])
                await handleSetIsFollowings(data.follows, false)
            }

            setSearchAfter(data.searchAfter)
            setHasMore(data.hasMore)

        } finally {
            setLoading(false)
        }
    }

    async function handleSetIsFollowings(data: any, reset: boolean) {

        const res = await Promise.all(data.map(async (follow: EditedFollow) => {

            try {
                if (followSwitch === 'following') {
                    const res = await isFollowingAction(follow.followingId)

                    return { isFollowing: res, isFollowingError: false }
                }
                else {
                    const res = await isFollowingAction(follow.followerId)
                    return { isFollowing: res, isFollowingError: false }
                }

            } catch (error) {
                return { isFollowing: false, isFollowingError: true }

            }
        }))
        if (reset) {
            setIsFollowings(res)
        }
        else {
            setIsFollowings(prev =>
                [...prev, ...res]
            )
        }


    }



    async function onSubmit(formData: Record<string, string>) {
        try {
            // console.log('formdata:', formData)
            // console.log('followSwitch:', followSwitch)

            setFollows([])
            setSearchAfter(null)
            setHasMore(true)
            fetchUsers({ reset: true })
        } catch (error) {
            toast.error("Search failed", {
                description: String(error),
            })
        }
    }


    const loaderRef = useInfiniteScroll({
        loading,
        hasMore,
        onLoadMore: () => fetchUsers({ reset: false })
    })

    const followsList = (
        <div className="overflow-y-auto">
            <div className="flex flex-col gap-1">
                {follows.map((follow, i) => (
                    <FollowUserCard
                        key={follow.id}
                        selfProfile={selfProfileCheck}
                        followType={followSwitch}
                        follow={follow}
                        isFollowing={isFollowings[i]}
                        setIsFollowings={setIsFollowings}
                        setFollows={setFollows}
                        index={i}
                        selfUsername={session?.user.username}
                    />

                ))}
            </div>


            {hasMore && (
                <div ref={loaderRef} className="border-s-2 w-full border-amber-500 h-10" />
            )}
        </div>
    )






    useEffect(() => {
        fetchUsers({ reset: true })

    }, [])


    useEffect(() => {
        if (!searchInput.trim()) return

        const timer = setTimeout(() => {
            form.handleSubmit(data => onSubmit(data))()
        }, 400)

        return () => clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        setFollows([])
        setSearchAfter(null)
        setHasMore(true)
        fetchUsers({ reset: true })
    }, [followSwitch])

    return (
        <Dialog open={followModalOpen} onOpenChange={(open) => {
            setFollowModalOpen(open)

            if (!open) {
                // Dialog kapandığında yapılacak işlem
                form.setValue('searchInput', '')
                console.log('searchInput:', searchInput);

            }
        }}>
            <DialogContent className="w-[95vw] max-w-lg  max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className={`h-fit text-center`}>
                        Users
                    </DialogTitle>
                </DialogHeader>
                <div className=" grid grid-cols-2 gap-2">
                    <Card onClick={() => { setFollowSwitch('follower') }}
                        className={`text-center h-2 justify-center border-2 ${followSwitch === 'follower' ? `bg-blue-500` : ``}`}>
                        Followers
                    </Card>
                    <Card onClick={() => { setFollowSwitch('following') }}
                        className={`text-center h-2 justify-center border-2 ${followSwitch === 'following' ? `bg-blue-500` : ``}`}>
                        Following
                    </Card>

                </div>

                <form id="search" >
                    <FieldGroup>
                        <Controller
                            name="searchInput"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        {...field}
                                        id="searchInput"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="..."
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>

                {follows.length > 0 && followsList}

            </DialogContent>
        </Dialog>
    )
}