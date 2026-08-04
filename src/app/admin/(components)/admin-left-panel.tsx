import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "../../../components/ui/card"

const AdminLeftPanel = async () => {
    return (
        <div>
            <Card>
                <CardHeader className="border-b text-center text-">
                    Admin settings
                </CardHeader>
                <CardContent>
                    <Link href="./server-buttons">
                        Server buttons
                    </Link>
                </CardContent>
                <CardContent>
                    <Link href="./user-info">
                        User info
                    </Link>
                </CardContent>
                <CardContent>
                    <Link href="./change-password">
                        Change password
                    </Link>
                </CardContent>

            </Card>
        </div>
    )
}

export default AdminLeftPanel