"use client"

import { useState } from "react"

export default function ProfilePage() {
    const [imageUrl, setImageUrl] = useState("")

    async function uploadImage(file: File) {
        const formData = new FormData()

        formData.append("file", file)
        formData.append("upload_preset", "profile_images")

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        )

        const data = await res.json()

        return data.secure_url
    }

    return (
        <>
            <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    const url = await uploadImage(file)

                    setImageUrl(url)

                    await fetch("/api/user/image", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            image: url,
                        }),
                    })
                }}
            />

            {imageUrl && (
                <img
                    src={imageUrl}
                    width={200}
                    alt="avatar"
                />
            )}
        </>
    )
}