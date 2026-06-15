// 'use client'

import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function egemPage() {

    // const {
    //     data: session,
    //     isPending,
    // } = authClient.useSession()

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const account = await prisma.account.findFirst({
        where: {
            userId: session?.user.id
        }
    })


    return (
        <>
            <h1 className="text-red-600"> session.user</h1>
            {session && (
                <>
                    <span>
                        {Object.entries(session.user).map(([e, g]: [any, any], i: number) => {
                            return (
                                <div key={i}>
                                    <h1> {e}</h1>
                                    <h1> {String(g)}</h1>
                                </div>

                            )
                        })}
                    </span>

                    {/* <button
                        onClick={() => authClient.signOut()}
                    >
                        Logout
                    </button> */}
                </>
            )}
            <h1 className="text-red-600"> ACCOUNT</h1>
            {session && (
                <>
                    <span>
                        {account && Object.entries(account).map(([e, g]: [any, any], i: number) => {
                            return (
                                <div key={i}>
                                    <h1> {e}</h1>
                                    <h1> {String(g)}</h1>
                                </div>

                            )
                        })}
                    </span>

                </>
            )}

        </>
    )
}