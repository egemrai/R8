"use client"

import { Eye, EyeOff } from "lucide-react"
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

const formSchema = z.object({
    currentPassword: z
        .string()
        .min(1, "Current password must be at least 1 characters.")
        .max(32, "Current password must be at most 32 characters."),
    newPassword: z
        .string()
        .min(1, "New password must be at least 1 characters.")
        .max(32, "New password must be at most 32 characters."),
    confirmPassword: z
        .string()
        .min(1, "Confirm password must be at least 1 characters.")
        .max(32, "Confirm password must be at most 32 characters."),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"], // hata confirmPassword alanına yazılır
    })

export function ChangePasswordForm() {

    const router = useRouter()

    // const {
    //     data: session,
    //     isPending,
    // } = authClient.useSession()

    // useEffect(() => {
    //     if (session) {
    //         router.push("/")
    //     }
    // }, [session])

    const [currentPasswordInputType, setCurrentPasswordInputType] = useState<"text" | "password">('password')
    const [newPasswordInputType, setNewPasswordInputType] = useState<"text" | "password">('password')
    const [confirmPasswordInputType, setConfirmPasswordInputType] = useState<"text" | "password">('password')


    const { handleSubmit, control } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: "",
            confirmPassword: '',
        },
    })

    async function onSubmit(formData: z.infer<typeof formSchema>, revoke: boolean) {
        try {

            const { error } = await authClient.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                revokeOtherSessions: revoke,
            })

            if (error) {
                throw new Error(error.message)
            }

            toast.success('Password changed successfully.')
        } catch (error) {
            toast.error("Password changed failed.", {
                description: String(error),
            })
        }

    }

    return (
        <Card className="w-full  max-w-full sm:max-w-md">
            <CardHeader className="flex flex-col items-center "> {/* text-center justify-center*/}
                <CardTitle>Change password form</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="change-password-form" >
                    <FieldGroup>
                        <Controller
                            name="currentPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field
                                    data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="currentPassword">
                                        Current password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input
                                            className="pr-10"
                                            {...field}
                                            id="currentPassword"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="..."
                                            autoComplete="off"
                                            type={currentPasswordInputType}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                toast.success(`${e.currentTarget.value}`)
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPasswordInputType(prev => prev === 'password' ? 'text' : 'password')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            {currentPasswordInputType === 'password' ? (
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

                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="newPassword">
                                        New password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            id="newPassword"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="..."
                                            autoComplete="off"
                                            type={newPasswordInputType}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewPasswordInputType(prev => prev === 'password' ? 'text' : 'password')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            {newPasswordInputType === 'password' ? (
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
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            id="confirmPassword"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="..."
                                            autoComplete="off"
                                            type={confirmPasswordInputType}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setConfirmPasswordInputType(prev => prev === 'password' ? 'text' : 'password')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            {confirmPasswordInputType === 'password' ? (
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

                    <Button className="bg-blue-400" type="submit" variant="outline" form="change-password-form"
                        onClick={handleSubmit(data => onSubmit(data, true))}>
                        Revoke other sessions and change password
                    </Button>
                    <Button className="bg-blue-400" type="submit" variant="outline" form="change-password-form"
                        onClick={handleSubmit(data => onSubmit(data, false))}>
                        Change password
                    </Button>


                </Field>

            </CardFooter>
        </Card>
    )
}

