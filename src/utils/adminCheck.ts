import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function adminCheck() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session?.user.role !== "admin") {
        return false
    }
    else return true

}