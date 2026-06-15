import Image from "next/image"
import Button from '@/components/tailwind/Button'
import CldIMage from '@/components/egem-ui/CldImage'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProfilePage() {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    return (
        <>
            <div className=" text-white p-4">
                <Button
                    name={'admin'}
                />
                <Button
                    name={'user'}
                />


                <img
                    src={session?.user?.image || ''}
                    width={400}
                    height={400}
                    alt="avatar"
                />

            </div>
        </>
    )
}
