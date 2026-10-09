"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signInAction } from "@/actions/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { requestPasswordReset } from "better-auth/api"

export function ForgotPasswordForm() {

    const router = useRouter()

    const {
        data: session,
        isPending,
    } = authClient.useSession()


    useEffect(() => {
        if (!isPending && session) {
            router.replace("/")
        }
    }, [session])

    const formSchema = z.object({
        email: z
            .email("Invalid email")
            .trim(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(formData: z.infer<typeof formSchema>) {
        try {

            if (session) {
                throw new Error('Already signed in')
            }
            const { data, error } = await authClient.requestPasswordReset({
                email: formData.email, // required
                redirectTo: "/reset-password",

            })

            if (error) {
                throw new Error(error.message)
            }
            toast.success('email successfully sent.')
        } catch (error) {
            toast.error("Send reset password email failed", {
                description: String(error) || 'e',
            })
        }
    }

    return (
        <Card className="w-full sm:max-w-md ">
            <CardHeader className="flex flex-col items-center "> {/* text-center justify-center*/}

            </CardHeader>
            <CardContent>
                <form id="get-reset-password-URL-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="..."
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="vertical">

                    <Button className="bg-blue-500" type="submit" variant="outline" form="get-reset-password-URL-form">
                        Send reset password email
                    </Button>
                    <Link className="text-center underline" href={`/sign-up`}>
                        Sign up
                    </Link>
                    <Link className="text-center underline" href={`/sign-in`}>
                        Sign in
                    </Link>
                </Field>
            </CardFooter>
        </Card>
    )
}

