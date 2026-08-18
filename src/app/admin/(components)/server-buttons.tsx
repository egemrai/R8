'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react";
import { toast } from "sonner"
import { deleteFollowFromElasticSearchAction, deleteFollowsFromElasticSearchAction, deleteUsersFromElasticSearchAction, getAllFollowsFromElasticSearchAction, getAllUsersFromElasticSearchAction, indexFollowsToElasticSearchAction, indexUsersToElasticSearchAction } from "../actions/server-buttons"
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DeleteFollowFromElasticSearchParams } from "@/utils/types/elasticSearch";

interface IndexUsersToElasticSearchActionResult {
    success: boolean
    message: string
}

export default function ServerButtons() {

    const [handleIndexUsersToElasticSearchActionLoading, setHandleIndexUsersToElasticSearchActionLoading] = useState(false)
    const [handleIndexFollowsToElasticSearchActionLoading, setHandleIndexFollowsToElasticSearchActionLoading] = useState(false)
    const [handleGetAllUsersFromElasticSearchActionLoading, setHandleGetAllUsersFromElasticSearchActionLoading] = useState(false)
    const [handleGetAllFollowsFromElasticSearchActionLoading, setHandleGetAllFollowsFromElasticSearchActionLoading] = useState(false)
    const [handleDeleteUsersFromElasticSearchActionLoading, setHandleDeleteUsersFromElasticSearchActionLoading] = useState(false)
    const [handleDeleteFollowFromElasticSearchActionLoading, setHandleDeleteFollowFromElasticSearchActionLoading] = useState(false)
    const [handleDeleteFollowsFromElasticSearchActionLoading, setHandleDeleteFollowsFromElasticSearchActionLoading] = useState(false)

    const deleteUserform = useForm<any>({
        defaultValues: {
            userIds: ''
        },
    })

    const deleteFollowform = useForm<DeleteFollowFromElasticSearchParams>({
        defaultValues: {
            followerId: '',
            followingId: '',
        },
    })

    const deleteFollowsform = useForm<any>({
        defaultValues: {
            userId: ''
        },
    })

    const handleIndexUsersToElasticSearchAction = async () => {
        setHandleIndexUsersToElasticSearchActionLoading(true)
        try {
            const result: IndexUsersToElasticSearchActionResult = await indexUsersToElasticSearchAction()

            if (result.success) {
                toast.success('Success!', {
                    description: result.message,
                })
            }
            else {
                toast.error('Error!', {
                    description: result.message,
                })
            }
        } catch (error) {
            console.error(error)
        }
        finally {
            setHandleIndexUsersToElasticSearchActionLoading(false)
        }
    }

    const handleIndexFollowsToElasticSearchAction = async () => {
        setHandleIndexFollowsToElasticSearchActionLoading(true)
        try {

            const result: IndexUsersToElasticSearchActionResult = await indexFollowsToElasticSearchAction()

            if (result.success) {
                toast.success('Success!', {
                    description: result.message,
                })
            }
            else {
                toast.error('Error!', {
                    description: result.message,
                })
            }

        } catch (error) {
            console.error(error)
        }
        finally {
            setHandleIndexFollowsToElasticSearchActionLoading(false)
        }
    }

    const handleGetAllUsersFromElasticSearchAction = async () => {
        setHandleGetAllUsersFromElasticSearchActionLoading(true)
        try {
            const res = await getAllUsersFromElasticSearchAction()
            console.log('res:', res.res)
        } catch (error) {
            console.error(error)
        }
        finally {
            setHandleGetAllUsersFromElasticSearchActionLoading(false)
        }

    }

    const handleGetAllFollowsFromElasticSearchAction = async () => {
        setHandleGetAllFollowsFromElasticSearchActionLoading(true)
        try {
            const res = await getAllFollowsFromElasticSearchAction()
            console.log('res:', res.res)
        } catch (error) {
            console.error(error)
        }
        finally {
            setHandleGetAllFollowsFromElasticSearchActionLoading(false)
        }

    }

    // sadece id,id,id başında sonunda bir şey yok. Fonksiyon içinde  trim() old için boşluk tab falan kullanılır.
    const handleDeleteUsersFromElasticSearchAction = async (data: any) => {
        setHandleDeleteUsersFromElasticSearchActionLoading(true)
        try {
            const res = await deleteUsersFromElasticSearchAction(data.userIds)
            console.log('res:', res)
            if (res.success === true) {
                toast.success('Success', {
                    description:
                        'All users deleted from ES'
                })
            }
            else {
                toast.error(`Error`, {
                    description: (
                        <div>
                            {res.message.map((user: any, i: number) => {
                                return (
                                    <p key={i}>
                                        {`${i}) id: ${user.id} - error: ${user.result}`}
                                    </p>
                                )
                            })}
                        </div>
                    )
                })
            }
        } catch (error) {
            console.error(error)
        }
        finally {
            setHandleDeleteUsersFromElasticSearchActionLoading(false)
        }

    }

    const handleDeleteFollowFromElasticSearchAction = async (data: any) => {
        setHandleDeleteFollowFromElasticSearchActionLoading(true)
        try {
            const res = await deleteFollowFromElasticSearchAction(data)
            console.log('res:', res)
            if (res.success === true) {
                toast.success('Success', {
                    description:
                        res.message
                })
            }
            else {
                toast.error(`Error`, {
                    description:
                        res.message
                })
            }
        } catch (error) {
            console.error(error)
        }
        finally {
            setHandleDeleteFollowFromElasticSearchActionLoading(false)
        }

    }

    const handleDeleteFollowsFromElasticSearchAction = async (data: any) => {
        setHandleDeleteFollowsFromElasticSearchActionLoading(true)
        try {
            const res = await deleteFollowsFromElasticSearchAction(data)
            // console.log('res:', res)
            if (res.success === true) {
                toast.success('Success', {
                    description:
                        res.message
                })
            }
            else {
                toast.error(`Error`, {
                    description:
                        res.message
                })
            }
        } catch (error) {
            console.error(error)
        }
        finally {
            setHandleDeleteFollowsFromElasticSearchActionLoading(false)
        }

    }



    const test = async () => {
        try {
            const res = await fetch(`/api/get-user`)
            const data = await res.json()
            console.log('es search:', data)
        } catch (error) {
            console.error(error)
        }

    }




    return (

        <div className="flex flex-col gap-2 min-w-140 ">
            <div className="flex items-center">
                <Button onClick={handleIndexUsersToElasticSearchAction}
                    disabled={handleIndexUsersToElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-blue-500 hover:cursor-pointer hover:bg-blue-700 disabled:bg-amber-600" />
                {` ==> ES index users`}
            </div>

            <div className="flex items-center">
                <Button onClick={handleIndexFollowsToElasticSearchAction}
                    disabled={handleIndexFollowsToElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-purple-500 hover:cursor-pointer hover:bg-purple-700 disabled:bg-amber-600" />
                {` ==> ES index follows`}
            </div>

            <div className="flex items-center">
                <Button onClick={handleGetAllUsersFromElasticSearchAction}
                    disabled={handleGetAllUsersFromElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-blue-500 hover:cursor-pointer hover:bg-blue-700 disabled:bg-amber-600" />
                {` ==> GetAllUsersFromES`}
            </div>

            <div className="flex items-center">
                <Button onClick={handleGetAllFollowsFromElasticSearchAction}
                    disabled={handleGetAllFollowsFromElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-purple-500 hover:cursor-pointer hover:bg-purple-700 disabled:bg-amber-600" />
                {` ==> GetAllFollowsFromES`}
            </div>

            <div className="flex ">
                <form id="deleteUser" >
                    <FieldGroup className="min-w-80">
                        <Controller
                            name="userIds"
                            control={deleteUserform.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Textarea
                                        {...field}
                                        id="userIds"
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

                <div className="flex flex-row items-center mt-2 h-fit">
                    <Button onClick={deleteUserform.handleSubmit(data => handleDeleteUsersFromElasticSearchAction(data))}
                        disabled={handleDeleteUsersFromElasticSearchActionLoading}
                        className="h-8 w-12 rounded-full bg-blue-500 hover:cursor-pointer hover:bg-blue-700 disabled:bg-amber-600" />
                    <span >
                        {` ==> DeleteUsersFromES`}
                    </span>
                </div>
            </div>

            <div className="flex items-center">

                <Label htmlFor="deleteFollowFollowerId">Follower id:</Label>
                <Input className="max-w-50" id="deleteFollowFollowerId" {...deleteFollowform.register("followerId")} />

                <Label htmlFor="deleteFollowFollowingId">Following id:</Label>
                <Input className="max-w-50" id="deleteFollowFollowingId" {...deleteFollowform.register("followingId")} />

                <Button onClick={deleteFollowform.handleSubmit((data) => handleDeleteFollowFromElasticSearchAction(data))}
                    disabled={handleDeleteFollowFromElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-purple-500 hover:cursor-pointer hover:bg-purple-700 disabled:bg-amber-600" />
                {` ==> DeleteFollowFromES`}
            </div>

            <div className="flex items-center">

                <Label htmlFor="deleteFollows">User id:</Label>
                <Input className="max-w-50" id="deleteFollows" {...deleteFollowsform.register("userId")} />

                <Button onClick={deleteFollowsform.handleSubmit((data) => handleDeleteFollowsFromElasticSearchAction(data))}
                    disabled={handleDeleteFollowsFromElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-blue-500 hover:cursor-pointer hover:bg-blue-700 disabled:bg-amber-600" />
                {` ==> DeleteFollowFromES`}
            </div>

            <div className="flex items-center">
                <Button onClick={() => test()}
                    disabled={handleGetAllFollowsFromElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-purple-500 hover:cursor-pointer hover:bg-purple-700 disabled:bg-amber-600" />
                {` ==> es search`}
            </div>


        </div>


    )
}

