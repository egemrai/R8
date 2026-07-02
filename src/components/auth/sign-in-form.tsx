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
import { signInAction } from "@/app/actions/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"


export function SignInForm() {

    const router = useRouter()

    const {
        data: session,
        isPending,
    } = authClient.useSession()

    const [passwordInputType, setPasswordInputType] = useState<"text" | "password">('password')

    useEffect(() => {
        if (session) {
            router.push("/")
        }
    }, [session])

    const formSchema = z.object({
        username: z
            .string()
            .min(1, "Username must be at least 1 characters.")
            .max(32, "Username must be at most 32 characters.")
            .regex(/^[a-z](?:[a-z0-9]|[_.](?![_.])){0,31}$/, "Invalid username format"),
        password: z
            .string()
            .min(1, "Password must be at least 1 characters.")
            .max(32, "Password must be at most 32 characters."),

    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: ''
        },
    })

    async function onSubmit(formData: z.infer<typeof formSchema>) {
        try {

            if (session) {
                throw new Error('Already signed in')
            }
            const { data, error } = await authClient.signIn.username({
                username: formData.username, // required
                password: formData.password, // required
            })

            if (error) {
                throw new Error(error.message)
            }

        } catch (error) {
            toast.error("Sign in failed", {
                description: String(error) || 'e',
            })
        }
    }

    return (
        <Card className="w-full sm:max-w-md ">
            <CardHeader className="flex flex-col items-center "> {/* text-center justify-center*/}

            </CardHeader>
            <CardContent>
                <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="username">
                                        Username
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="username"
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

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input className="pr-10"
                                            {...field}
                                            id="password"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="..."
                                            autoComplete="off"
                                            type={passwordInputType}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPasswordInputType(prev => prev === 'password' ? 'text' : 'password')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            {passwordInputType === 'password' ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
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

                    <Button className="bg-blue-500" type="submit" variant="outline" form="sign-in-form">
                        Sign in
                    </Button>
                    <Link className="text-center underline" href={`/sign-up`}>
                        Sign up instead
                    </Link>
                </Field>
            </CardFooter>
        </Card>
    )
}

