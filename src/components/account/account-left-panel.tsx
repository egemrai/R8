import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "../ui/card"

const AccountLeftPanel = async () => {
    return (
        <div>
            <Card>
                <CardHeader className="border-b text-center text-">
                    Account settings
                </CardHeader>
                <CardContent >
                    <Link href="./profile">
                        Profile
                    </Link>
                </CardContent>
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
    )
}

export default AccountLeftPanel