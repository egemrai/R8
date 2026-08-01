'use client'

import { CldImage } from "next-cloudinary"

interface CldImageProps {
    user: any
}

export function UserCldImage({ user }: CldImageProps) {

    return (
        <CldImage
            src={user.image}
            width={50}
            height={50}
            alt="avatar"
            className="rounded-full"
            radius='max'
        />
    )
}