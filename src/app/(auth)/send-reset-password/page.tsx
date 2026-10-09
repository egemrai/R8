import { Container } from "@/components/egem-ui/Container"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

interface UserPageProps {
    params: any //Promise<{ role: string }>
    searchParams: any //Promise<{ [key: string]: string | string[] | undefined | any }>
    propTest: string
}

export default async function UserPage({ params, searchParams, propTest }: UserPageProps) {


    return (
        <>
            <Container className={' border-2'}>
                <div className="min-h-screen flex items-center justify-center">

                    <ForgotPasswordForm />

                </div>
            </Container>

        </>
    )
}
