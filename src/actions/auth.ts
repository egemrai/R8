"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type SignUpData = {
    email: string
    password: string
    username: string
    name?: string
}

export async function signUpAction(credentials: SignUpData) {

    // // const name = form.get('name') as string | undefined
    // await auth.api.signUpEmail({
    //     body: {
    //         email: credentials.email,
    //         password: credentials.password,
    //         username: credentials.username,
    //         name: credentials.name || '',
    //     }
    // })

    // redirect('/')
    try {
        await auth.api.signUpEmail({
            body: {
                email: credentials.email,
                password: credentials.password,
                username: credentials.username,
                name: credentials.name || '',
            }
        })

        return {
            success: true,
            message: "signUp successfull"
        }
    } catch (error: any) {
        return {
            success: false,
            message: "signUp failed"
        }
    }
}

type SignInData = {
    password: string
    username: string
}
export async function signInAction(credentials: SignInData) {
    try {
        if (!credentials.username || !credentials.password) {
            throw new Error("SignIn username and password are required")
        }

        const user = await prisma.user.findUnique({
            where: {
                username: credentials.username
            }
        })

        if (!user) {
            throw new Error("Invalid username or password")
        }

        await auth.api.signInEmail({
            body: {
                email: user.email,
                password: credentials.password,

            }
        })
        return {
            success: true,
            message: "signIn successfull"
        }
        // redirect('/')
    } catch (error: any) {
        return {
            success: false,
            message: "signIn failed"
        }
    }

}

export async function signOutAction() {

    await auth.api.signOut({
        headers: await headers()
    })

    redirect('/')
}




