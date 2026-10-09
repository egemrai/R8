import { Container } from "@/components/egem-ui/Container"
import style from '../account.module.css'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { ChangePasswordForm } from "@/app/account/(components)/change-password-form"
import AccountLeftPanel from "@/app/account/(components)/account-left-panel"

export async function ChangePasswordPage() {

    return (
        <>

            <ChangePasswordForm />


        </>
    )

}

export default ChangePasswordPage

//egem