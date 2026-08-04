import { Container } from "@/components/egem-ui/Container"
import style from '../account.module.css'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import AccountLeftPanel from "@/components/account/account-left-panel"
import AccountProfile from "@/components/account/account-profile"

export async function ProfilePage() {

    return (
        <>

            <AccountProfile />


        </>
    )

}

export default ProfilePage