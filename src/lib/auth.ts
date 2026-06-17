import { APIError, betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "./prisma"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins"
import { headers } from "next/headers"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    databaseHooks: {
        session: {
            create: {
                before: async (session, ctx) => {

                    //Hook içinde getSession() tehlikeli olabilirmiş, o yüzden kullanamıyorum
                    // const session_ = await auth.api.getSession({
                    //     headers: await headers(),
                    // })
                    // if (session_) {
                    //     throw new Error('session already exist')
                    // }
                    // console.log('şu anlık session_:', session_)

                    console.log('şu an giriş yapılacak olan session ön bilgileri:', session)

                    const MAX_SESSIONS = 4

                    if (!session.userId) {
                        throw new Error('databaseHook session create before -> session.userId missing')
                    }

                    // Query existing sessions for this user
                    const existingSessions = await ctx?.context.adapter.findMany({
                        model: "session",
                        where: [{ field: "userId", value: session.userId }]
                    })

                    if (!existingSessions) {
                        throw new Error('databaseHook session create before -> existingSessions missing')
                    }

                    if (existingSessions.length >= MAX_SESSIONS) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Session limit reached",
                        })
                    }

                    return {
                        data: session,
                    }
                },
            },
        },
    },


    emailAndPassword: {
        enabled: true,
        minPasswordLength: 1,
        maxPasswordLength: 32,
    },
    plugins: [nextCookies(), username()],
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: true,
                unique: true,

            },
        },
    },
    rateLimit: {
        enabled: true,
        //...other options
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 1 * 4 // Cache duration in seconds (5 minutes)
        }
    }
})

// type Session = typeof auth.$Infer.Session
export type Session = typeof auth.$Infer.Session