import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Container } from "@/components/egem-ui/Container"
import { Suspense } from "react"

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

                    <Suspense fallback={<p>Yükleniyor...</p>}>
                        <ResetPasswordForm />
                    </Suspense>

                </div>
            </Container>

        </>
    )
}
