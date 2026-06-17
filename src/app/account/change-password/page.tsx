import { Container } from "@/components/egem-ui/Container"
import style from './user-info.module.css'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { ChangePasswordForm } from "@/components/Change-password-form"

export async function UserInfoPage() {

    return (
        <>

            <Container >
                <h1 className={`${style.egem} font-bold text-5xl text-end`}>renk güzel</h1>
                <div className={`${style.grid_div}`}>
                    <div>
                        <Card className="">
                            <CardHeader className="border-b text-center text-">
                                Account settings
                            </CardHeader>
                            <CardContent >
                                <Link href="./user-info">
                                    User info
                                </Link>
                            </CardContent>
                            <CardContent >
                                <Link href="./change-password">
                                    Change password
                                </Link>
                            </CardContent>

                        </Card>
                    </div>
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