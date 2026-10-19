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
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { requestPasswordReset } from "better-auth/api"

export function ResetPasswordForm() {

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

    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [newPasswordInputType, setNewPasswordInputType] = useState<"text" | "password">('password')
    const [confirmPasswordInputType, setConfirmPasswordInputType] = useState<"text" | "password">('password')

    useEffect(() => {
        if (!token) {
            toast.error("Missing token.")
            router.push("/")
        }
    }, [token, router])

    const formSchema = z.object({
        newPassword: z
            .string()
            .min(1, "New password must be at least 1 characters.")
            .max(32, "New password must be at most 32 characters."),
        confirmPassword: z
            .string()
            .min(1, "Confirm password must be at least 1 characters.")
            .max(32, "Confirm password must be at most 32 characters."),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"], // hata confirmPassword alanına yazılır
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: '',
        },
    })

    async function onSubmit(formData: z.infer<typeof formSchema>) {
        try {

            if (session) {
                throw new Error('Already signed in')
            }
            if (!token) {
                toast.error("Missing token.")
                return
            }
            const { data, error } = await authClient.resetPassword({
                newPassword: formData.newPassword, // required 
                token: token,

            })

            if (error) {
                throw new Error(error.message)
            }

            toast.success('Password changed successfully.')
        } catch (error) {
            toast.error("failed to change password.", {
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
                        <Field data-invalid={!!form.formState.errors.newPassword}>
                            <FieldLabel htmlFor="imageCount">
                                New password
                            </FieldLabel>

                            <div className="relative">
                                <Input
                                    className="pr-10"
                                    id="newPassword"
                                    aria-invalid={!!form.formState.errors.newPassword}
                                    placeholder="..."
                                    autoComplete="off"
                                    type={newPasswordInputType}
                                    {...form.register("newPassword")}
                                // {...form.register("newPassword", {
                                //     onChange: (e) => {
                                //         toast.success(`${e.currentTarget.value}`)
                                //     },
                                // })}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setNewPasswordInputType(prev =>
                                            prev === "password" ? "text" : "password"
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    {newPasswordInputType === "password" ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {form.formState.errors.newPassword && (
                                <FieldError errors={[form.formState.errors.newPassword]} />
                            )}
                        </Field>

                        <Field data-invalid={!!form.formState.errors.confirmPassword}>
                            <FieldLabel htmlFor="confirmPassword">
                                Confirm password
                            </FieldLabel>

                            <div className="relative">
                                <Input
                                    className="pr-10"
                                    id="confirmPassword"
                                    aria-invalid={!!form.formState.errors.confirmPassword}
                                    placeholder="..."
                                    autoComplete="off"
                                    type={confirmPasswordInputType}
                                    {...form.register("confirmPassword")}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setConfirmPasswordInputType(prev =>
                                            prev === "password" ? "text" : "password"
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    {confirmPasswordInputType === "password" ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {form.formState.errors.confirmPassword && (
                                <FieldError errors={[form.formState.errors.confirmPassword]} />
                            )}
                        </Field>

                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="vertical">

                    <Button className="bg-blue-500" type="submit" variant="outline" form="get-reset-password-URL-form">
                        Set new password
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

