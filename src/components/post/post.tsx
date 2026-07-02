'use client'

import Link from "next/link"
import { Menu } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Session } from "@/lib/auth"
import { useEffect, useState } from "react"
import { CldImage } from "next-cloudinary"
import { Button } from "../ui/button"
import { Card, CardHeader } from "../ui/card"

export function Post() {
    const pathname = usePathname()

    const [username, setUsername] = useState<string>('antimage')


    const {
        data: session,
        isPending,
    } = authClient.useSession()

    useEffect(() => {
        if (!isPending && session) {


            const annen = (session?.user as any)
        }
    }, [session])


    return (

        <Card className="flex flex-col">
            <CardHeader className="flex flex-row gap-2 items-center ">
                {session?.user?.image &&
                    <CldImage
                        src={session?.user?.image}
                        width={50}
                        height={50}
                        alt="avatar"
                        className="rounded-full"
                        radius='max'
                    />}
                <p className="overflow-hidden">
                    {session?.user.username + 'slkdmaklwefmklwaefwealefamwlefmawlkefmawelfkmawlfmawlfkmaewlfmawlkfemklwaeflsdfmawlfmwalkfkew'}
                </p>
                <Button className=" ml-auto bg-white text-black">
                    ...
                </Button>

            </CardHeader>
            <div className="">
                resim
            </div>
        </Card>
    )
}