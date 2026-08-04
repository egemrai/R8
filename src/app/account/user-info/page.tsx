import { Container } from "@/components/egem-ui/Container"
import style from '../account.module.css'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import AccountLeftPanel from "@/components/account/account-left-panel"

export async function UserInfoPage() {

    return (
        <>

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

        </>
    )

}

export default UserInfoPage