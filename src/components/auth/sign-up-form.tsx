"use client"

import * as React from "react"
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
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import { signUpAction } from "@/app/actions/auth"
import Link from "next/link"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Eye, EyeOff } from "lucide-react"

const formSchema = z.object({
    username: z
        .string()
        .min(1, "Username must be at least 1 characters.")
        .max(32, "Username must be at most 32 characters."),
    password: z
        .string()
        .min(1, "Password must be at least 1 characters.")
        .max(32, "Password must be at most 32 characters."),
    email: z
        .email("Invalid email")
        .trim(),
    name: z
        .string()
        .optional(),
})

export function SignUpForm() {

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


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            name: "",
            email: '',
            password: ''
        },
    })


    async function onSubmit(formData: z.infer<typeof formSchema>) {
        try {
            if (session) {
                throw new Error('Already signed in')
            }

            const { data, error } = await authClient.signUp.email({
                email: formData.email, // required
                username: formData.username, // required
                password: formData.password, // required
                name: formData.name || 'e', // required
            })

            if (error) {
                throw new Error(error.message)
            }
        } catch (error) {
            toast.error("Sign up failed", {
                description: String(error),
            })
        }

    }

    return (
        <Card className="w-full sm:max-w-md ">
            <CardHeader className="flex flex-col items-center "> {/* text-center justify-center*/}
                <CardTitle>Sign Up Form</CardTitle>
                <CardDescription>
                    üye olmak için doldur
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="sign-up-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="name">
                                        Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="name"
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

                    <Button className="bg-blue-500" type="submit" variant="outline" form="sign-up-form">
                        Sign up
                    </Button>

                    <Link className="text-center underline" href={`/sign-in`}>
                        Sign in instead
                    </Link>
                </Field>

            </CardFooter>
        </Card>
    )
}

