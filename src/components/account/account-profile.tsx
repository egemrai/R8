'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { CldImage } from "next-cloudinary"
import Cropper from 'react-easy-crop'
import { getCroppedImg } from "@/lib/cropImage"
import { Edit } from "lucide-react"

export function AccountProfile() {


    const [isUploading, setIsUploading] = useState(false)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const {
        data: session,
        isPending,
    } = authClient.useSession()

    const onCropComplete = useCallback(
        (_: any, croppedAreaPixels: any) => {
            console.log('croppedAreaPixels:', croppedAreaPixels)
            setCroppedAreaPixels(croppedAreaPixels)
        },
        []
    )

    async function uploadImage(file: File) {
        const formData = new FormData()

        formData.append("file", file)
        formData.append("upload_preset", "profile_images")

        const res = await fetch(  // console.log image-cloudinary-POST-fetch-return içinde var
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        )

        const data = await res.json()

        console.log('imgdata:', data)

        return data.public_id  //secure?url verince cldimage çalışmıyor, public_id istiyor
    }

    async function handleConfirm() {
        if (!selectedFile || !croppedAreaPixels) return

        try {
            setIsUploading(true)

            const croppedBlob = await getCroppedImg(
                previewUrl,
                croppedAreaPixels
            )

            const croppedFile = new File(
                [croppedBlob],
                "avatar.png",
                {
                    type: "image/png",
                }
            )

            const publicId = await uploadImage(croppedFile)

            if (publicId) {
                const res = await fetch("/api/user/add-image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        image: publicId,
                    }),
                })

                const data = await res.json()
                //alttaki databaseden önceki user pp silme requesti. bullmq yükleyince q'ya ekle
                if (data.success && session?.user?.image) {
                    await fetch("/api/user/delete-image", {
                        method: "POST",
                        body: JSON.stringify({
                            publicId: session?.user?.image,
                        }),
                    })

                }
            }


        } catch (error) {
            console.log(error)
        }
        finally {
            setIsUploading(false)
        }
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]

        if (!file) return

        try {

            setSelectedFile(file)

            const localPreview = URL.createObjectURL(file)

            setPreviewUrl(localPreview)

        } catch (error) {
            console.error(error)
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
        <Card className="flex flex-col p-4 border">
            <div className="flex flex-row w-full h-full items-center gap-4">
                {session &&
                    <>
                        <CldImage
                            src={session?.user?.image || ''}
                            width={100}
                            height={100}
                            alt="avatar"
                            className="rounded-full"
                            radius='max'
                        />
                    </>
                }

                <Dialog >
                    <DialogTrigger asChild>
                        <Button className="bg-blue-500 text-white rounded-full w-10 h-10 cursor-pointer">
                            <Edit />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change profile picture</DialogTitle>
                        </DialogHeader>

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

                            {previewUrl &&
                                <div className="mt-6">
                                    <div className="relative h-96 w-full">
                                        <Cropper
                                            image={previewUrl}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={1}
                                            cropShape="round"
                                            showGrid={false}
                                            onCropChange={setCrop}
                                            onZoomChange={setZoom}
                                            onCropComplete={onCropComplete}
                                        />
                                    </div>

                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.04}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="mt-4 w-full"
                                    />
                                </div>

                            }
                        </div>



                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? "Uploading..." : "Confirm"}
                        </Button>
                    </DialogContent>

                </Dialog>

            </div>




        </Card>
    )
}


export default AccountProfile