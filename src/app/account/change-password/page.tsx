import { Container } from "@/components/egem-ui/Container"
import style from '../account.module.css'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { ChangePasswordForm } from "@/components/account/change-password-form"
import AccountLeftPanel from "@/components/account/account-left-panel"

export async function UserInfoPage() {

    return (
        <>

            <Container >
                <h1 className={`${style.egem} font-bold text-5xl text-end`}>renk güzel</h1>
                <div className={`${style.grid_div}`}>
                    <AccountLeftPanel />
                    <div>
                        <ChangePasswordForm />
                    </div>

                </div>



            </Container>


        </>
    )

}

export default UserInfoPage

//egem