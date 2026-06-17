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

export function Navbar() {
    const pathname = usePathname()

    const [username, setUsername] = useState<string>('antimage')

    /*
    CLIENT SESSION

    Browser içinde çalışır.
  */
    const {
        data: session,
        isPending,
    } = authClient.useSession()

    useEffect(() => {
        if (!isPending && session) {


            const annen = (session?.user as any)
            setUsername(annen.username)
        }
    }, [session])

    // const user: Session["user"] | undefined = session?.user

    return (

        <header className="sticky top-0 z-50 border-b bg-blue-500">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Logo */}
                <Link href="/" className="font-bold">
                    R8
                </Link>
                {session &&
                    <>
                        {/* DESKTOP NAV */}
                        < nav className="hidden min-[601px]:flex items-center gap-6">

                            {/* <Link className={pathname === "/profile" ? "text-red-500" : "text-white"} href="/profile">Profile</Link> */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={`outline-none text-white hover:text-amber-500 hover:cursor-pointer`}>
                                        {username}
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">Profile</Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link href="/account/user-info">User info</Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link onClick={() => authClient.signOut()} href="/">Sign Out</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>

                        {/* MOBILE DROPDOWN */}
                        <div className="min-[600px]:hidden bg-amber-500">
                            <DropdownMenu>

                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 rounded-md hover:bg-muted">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className={`  hover:text-amber-500 hover:cursor-pointer`}>
                                                {username}
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile">Profile</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/account/user-info">User info</Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Link onClick={() => authClient.signOut()} href="/">Sign Out</Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">Profile</Link>
                                    </DropdownMenuItem>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                    </>
                }

                {!session &&
                    <>
                        {/* DESKTOP NAV */}
                        < nav className="hidden min-[601px]:flex items-center gap-6">

                            <Link onClick={() => console.log('ege:', pathname)} className={pathname === "/sign-in" ? "text-orange-600" : "text-white"} href="/sign-in">Sign in</Link>


                        </nav>

                    </>
                }



            </div>
        </header >
    )
}