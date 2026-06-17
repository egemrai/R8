import { Container } from "@/components/egem-ui/Container"
import style from './user-info.module.css'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export async function UserInfoPage() {

    return (
        <>

            <Container >
                <h1 className={`${style.egem} font-bold text-5xl text-end`}>renk güzel</h1>
                <div className={`${style.grid_div}`}>
                    <div>
                        <Card>
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
                        <Dialog >
                            <DialogTrigger asChild>
                                <Button>Open dialog</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Change password</DialogTitle>
                                </DialogHeader>

                                <p>Are you sure?</p>

                                <Button>Confirm</Button>
                            </DialogContent>

                        </Dialog>
                    </div>

                </div>



            </Container>


        </>
    )

}

export default UserInfoPage