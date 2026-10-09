import { Container } from "@/components/egem-ui/Container"
import style from './account.module.css'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { ChangePasswordForm } from "@/app/account/(components)/change-password-form"
import AccountLeftPanel from "@/app/account/(components)/account-left-panel"

export async function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>

            <Container >
                <h1 className={`${style.egem} font-bold text-5xl text-end`}>renk güzel</h1>
                <div className={`${style.grid_div}`}>
                    <AccountLeftPanel />
                    <div>
                        {children}
                    </div>

                </div>



            </Container>


        </>
    )

}

export default AccountLayout