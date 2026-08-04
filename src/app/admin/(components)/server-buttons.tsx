'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react";
import { toast } from "sonner"
import { indexUsersToElasticSearchAction } from "../actions/server-buttons"

interface IndexUsersToElasticSearchActionResult {
    success: boolean
    message: string
}

export default function ServerButtons() {

    const [handleIndexUsersToElasticSearchActionLoading, setHandleIndexUsersToElasticSearchActionLoading] = useState(false)

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






    return (

        <div className="flex flex-col ">
            <div className="flex items-center">
                <Button onClick={handleIndexUsersToElasticSearchAction}
                    disabled={handleIndexUsersToElasticSearchActionLoading}
                    className="h-8 w-12 rounded-full bg-blue-500 hover:cursor-pointer hover:bg-blue-700 " />
                {` ==> Elastic search index users`}
            </div>
            <div className="flex items-center">
                <Button className="h-8 w-12 rounded-full bg-red-500 hover:cursor-pointer hover:bg-red-700 " />
                {` ==> Elastic search index follows`}
            </div>

        </div>


    )
}