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
import { useEffect, useState } from "react"

export function Navbar() {
    const pathname = usePathname()

    /*
    CLIENT SESSION

    Browser içinde çalışır.
  */
    const {
        data: session,
        isPending,
    } = authClient.useSession()

    const [searchInput, setSearchInput] = useState("")

    const username = session?.user.username ?? ""
    const isSearchOpen = searchInput.length > 0

    useEffect(() => {
        const timer = setTimeout(() => {

        }, 400)

        return () => clearTimeout(timer)
    }, [searchInput])

    return (

        <header className="sticky top-0 z-50 border-b bg-blue-500">
            <div className="mx-auto grid h-16 max-w-7xl
                    grid-cols-[auto_minmax(0,1fr)_auto]
                    items-center gap-3 px-4
                    min-[901px]:grid-cols-[minmax(0,1fr)_minmax(0,24rem)_minmax(0,1fr)]
                    min-[901px]:gap-6
                    min-[901px]:px-6"
            >

                {/* SOL: Logo */}
                <Link
                    href="/"
                    className="justify-self-start font-bold text-white"
                >
                    R8
                </Link>

                {/* ORTA: Kullanıcı arama */}
                <div className="relative min-w-0">
                    <input
                        type="search"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Kullanıcı ara..."
                        aria-label="Kullanıcı ara"
                        className={`
                            w-full min-w-0 border border-gray-200
                            bg-white px-3 py-2 text-sm text-black
                            placeholder:text-gray-500
                            focus:outline-none
                            ${isSearchOpen ? "rounded-t-md" : "rounded-md"}
                        `}
                    />
                    {isSearchOpen && (
                        <div
                            className="
                absolute left-0 top-full z-50
                max-h-80 min-h-32 w-full
                overflow-y-auto rounded-b-lg
                border border-t-0 border-gray-200
                bg-white text-black shadow-lg
            "
                        >
                            <div className="p-4 text-sm text-gray-500">
                                Arama sonuçları burada görünecek.
                            </div>
                        </div>
                    )}
                </div>

                {/* SAĞ: Kullanıcı menüsü veya giriş bağlantısı */}
                <div className="min-w-0 justify-self-end">
                    {session && (
                        <>
                            {/* MASAÜSTÜ */}
                            <nav className="hidden items-center gap-6 min-[601px]:flex">
                                <Link
                                    href="/create-post"
                                    className={
                                        pathname === "/create-post"
                                            ? "whitespace-nowrap text-red-500"
                                            : "whitespace-nowrap text-white"
                                    }
                                >
                                    Create post
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="
                                                max-w-32 truncate text-white
                                                outline-none hover:cursor-pointer
                                                hover:text-amber-500
                                            "
                                        >
                                            {username}
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        className="w-40"
                                    >
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/account/user-info">
                                                User info
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/"
                                                onClick={() => authClient.signOut()}
                                            >
                                                Sign Out
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </nav>

                            {/* MOBİL */}
                            <div className="min-[601px]:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Menüyü aç"
                                            className="rounded-md p-2 text-white hover:bg-blue-600"
                                        >
                                            <Menu className="h-5 w-5" />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        className="w-40"
                                    >
                                        <DropdownMenuItem asChild>
                                            <Link href="/create-post">
                                                Create post
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link href="/account/user-info">
                                                User info
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/"
                                                onClick={() => authClient.signOut()}
                                            >
                                                Sign Out
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    )}

                    {!isPending && !session && (
                        <Link
                            href="/sign-in"
                            className={
                                pathname === "/sign-in"
                                    ? "whitespace-nowrap text-orange-600"
                                    : "whitespace-nowrap text-white"
                            }
                        >
                            Sign in
                        </Link>
                    )}
                </div>



            </div>
        </header >
    )
}
