"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

export default function ProfilePage() {
    const [imageUrl, setImageUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)

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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]

        if (!file) return

        try {
            setIsUploading(true)

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
        } finally {
            setIsUploading(false)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
        multiple: false,
    })

    return (
        <div className="mx-auto max-w-lg">
            <div
                {...getRootProps()}
                className={`
                    group cursor-pointer rounded-2xl border-2 border-dashed p-10
                    transition-all duration-200
                    ${isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                    }
                `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-3xl">
                        📷
                    </div>

                    {isUploading ? (
                        <>
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-black" />
                            <p className="font-medium">
                                Fotoğraf yükleniyor...
                            </p>
                        </>
                    ) : (
                        <>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Profil fotoğrafı yükle
                                </h3>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Sürükleyip bırak veya seçmek için tıkla
                                </p>
                            </div>

                            <button
                                type="button"
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                            >
                                Dosya Seç
                            </button>
                        </>
                    )}
                </div>
            </div>

            {imageUrl && (
                <div className="mt-6 flex justify-center">
                    <img
                        src={imageUrl}
                        alt="Profil fotoğrafı"
                        className="h-40 w-40 rounded-2xl object-cover shadow"
                    />
                </div>
            )}
        </div>
    )
}




// import { useState } from "react"

// export default function ProfilePage() {
//     const [imageUrl, setImageUrl] = useState("")

//     async function uploadImage(file: File) {
//         const formData = new FormData()

//         formData.append("file", file)
//         formData.append("upload_preset", "profile_images")

//         const res = await fetch(
//             `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//             {
//                 method: "POST",
//                 body: formData,
//             }
//         )

//         const data = await res.json()

//         return data.secure_url
//     }

//     return (
//         <>
//             <input
//                 type="file"
//                 accept="image/*"
//                 onChange={async (e) => {
//                     const file = e.target.files?.[0]
//                     if (!file) return

//                     const url = await uploadImage(file)

//                     setImageUrl(url)

//                     await fetch("/api/user/image", {
//                         method: "POST",
//                         headers: {
//                             "Content-Type": "application/json",
//                         },
//                         body: JSON.stringify({
//                             image: url,
//                         }),
//                     })
//                 }}
//             />

//             {imageUrl && (
//                 <img
//                     src={imageUrl}
//                     width={200}
//                     alt="avatar"
//                 />
//             )}
//         </>
//     )
// }