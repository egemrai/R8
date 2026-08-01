'use client'

import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface FollowModalProps {
    followModalOpen: boolean
    setFollowModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    followSwitch: 'following' | 'followers'
    setFollowSwitch: React.Dispatch<React.SetStateAction<'following' | 'followers'>>
}

export function FollowModal({ followModalOpen, setFollowModalOpen, followSwitch, setFollowSwitch }: FollowModalProps) {

    return (
        <Dialog open={followModalOpen} onOpenChange={setFollowModalOpen}>
            <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className={`text-center`}>
                        Users
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2">
                    <Card onClick={() => { setFollowSwitch('following'); toast('following') }}
                        className={`text-center border-2 ${followSwitch === 'following' ? `bg-blue-500` : ``}`}>
                        Following
                    </Card>
                    <Card onClick={() => { setFollowSwitch('followers'); toast('followers') }}
                        className={`text-center border-2 ${followSwitch === 'followers' ? `bg-blue-500` : ``}`}>
                        Followers
                    </Card>
                </div>

                araba
            </DialogContent>
        </Dialog>
    )
}