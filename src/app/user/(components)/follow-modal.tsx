'use client'

import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"


interface FollowModalProps {
    followModalOpen: boolean
    setFollowModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    followSwitch: 'following' | 'followers'
    setFollowSwitch: React.Dispatch<React.SetStateAction<'following' | 'followers'>>
}

export function FollowModal({ followModalOpen, setFollowModalOpen, followSwitch, setFollowSwitch }: FollowModalProps) {


    const form = useForm<Record<string, string>>({
        defaultValues: {
            searchInput: ''
        },
    })

    const searchInput = useWatch({
        control: form.control,
        name: "searchInput",
    })

    async function onSubmit(formData: Record<string, string>) {
        try {
            console.log('formdata:', formData)
            console.log('followSwitch:', followSwitch)
            // formData ile dbde search yap
        } catch (error) {
            toast.error("Sign up failed", {
                description: String(error),
            })
        }
    }


    useEffect(() => {
        if (!searchInput.trim()) return

        const timer = setTimeout(() => {
            form.handleSubmit(data => onSubmit(data))()
        }, 400)

        return () => clearTimeout(timer)
    }, [searchInput])

    return (
        <Dialog open={followModalOpen} onOpenChange={setFollowModalOpen}>
            <DialogContent className="w-[95vw] max-w-lg  max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className={`h-fit text-center`}>
                        Users
                    </DialogTitle>
                </DialogHeader>
                <div className=" grid grid-cols-2 gap-2">
                    <Card onClick={() => { setFollowSwitch('following'); toast('following') }}
                        className={`text-center h-2 justify-center border-2 ${followSwitch === 'following' ? `bg-blue-500` : ``}`}>
                        Following
                    </Card>
                    <Card onClick={() => { setFollowSwitch('followers'); toast('followers') }}
                        className={`text-center h-2 justify-center border-2 ${followSwitch === 'followers' ? `bg-blue-500` : ``}`}>
                        Followers
                    </Card>
                </div>

                <form id="search" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="searchInput"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        {...field}
                                        id="searchInput"
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

            </DialogContent>
        </Dialog>
    )
}