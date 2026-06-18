import { Container } from "@/components/egem-ui/Container"
import { SignUpForm } from "@/components/auth/sign-up-form"
import Image from "next/image"

interface UserPageProps {
    params: any //Promise<{ role: string }>
    searchParams: any //Promise<{ [key: string]: string | string[] | undefined | any }>
    propTest: string
}

export default async function UserPage({ params, searchParams, propTest }: UserPageProps) {






    return (
        <>
            <Container>
                <div className="min-h-screen flex items-center justify-center">

                    <SignUpForm />

                </div>
            </Container>

        </>
    )
}
