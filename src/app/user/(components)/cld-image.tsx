'use client'

import { CldImage } from "next-cloudinary"

interface CldImageProps {
    image: string
}

export function UserCldImage({ image }: CldImageProps) {

    return (
        <CldImage
            src={image}
            width={50}
            height={50}
            alt="avatar"
            className="rounded-full"
            radius='max'
        />
    )
}