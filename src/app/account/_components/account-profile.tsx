'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { CldImage } from "next-cloudinary"
import Cropper from 'react-easy-crop'
import { getCroppedImg } from "@/lib/cropImage"
import { Edit, Trash } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AccountProfile() {

    const router = useRouter()

    const {
        data: session,
        isPending,
    } = authClient.useSession()

    useEffect(() => {
        if (!isPending && !session) {
            router.replace("/")
        }
    }, [isPending, session, router])


    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)


    const deleteImage = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch("/api/user/delete-image", {
                method: "POST",
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error ?? "Failed to delete image")
            }

            await authClient.getSession({
                query: { disableCookieCache: true },
            })

            toast.success('Profile image successfully deleted.')
        } catch (error) {
            toast.error("Failed to delete image.", {
                description: String(error),
            })
        } finally {
            setIsDeleting(false)
        }

    }

    const onCropComplete = useCallback(
        (_: any, croppedAreaPixels: any) => {
            console.log('croppedAreaPixels:', croppedAreaPixels)
            setCroppedAreaPixels(croppedAreaPixels)
        },
        []
    )



    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]

        if (!file) return

        try {

            setSelectedFile(file)

            const localPreview = URL.createObjectURL(file)  // yüklenen fotonun geçici olarak gösterilmesini sağlayan fonksiyon

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

            const formData = new FormData()
            formData.append("file", croppedFile)

            //FormData kullanınca content-type yazılmıyor, kendisi otomatik ekliyor
            const res = await fetch("/api/user/add-image", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error ?? "Failed to upload image")
            }

            await authClient.getSession({
                query: { disableCookieCache: true },
            })

            toast.success('Profile image successfully uploaded.')
        } catch (error) {
            toast.error("Failed to upload image.", {
                description: String(error),
            })
        }
        finally {
            setIsUploading(false)
        }
    }

    return (
        <Card className="flex flex-col p-4 border">
            <div className="flex flex-row w-full h-full items-center gap-2">
                {session?.user?.image ?
                    <>
                        <CldImage
                            src={session?.user?.image}
                            width={100}
                            height={100}
                            alt="avatar"
                            className="rounded-full"
                            radius='max'
                        />
                    </>
                    : session ?
                        <Image
                            src={`/pp/${session.user.username!.charAt(0)}.png`}
                            width={100}
                            height={100}
                            alt="avatar"
                            className="rounded-full"
                        />
                        : <>
                        </>
                }

                <Dialog >
                    <DialogTrigger asChild>
                        <Button className="bg-blue-500 text-white rounded-full w-10 h-10 cursor-pointer">
                            <Edit />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
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
                                    <div className="flex items-center justify-center rounded-full bg-zinc-100
                                                    h-12 w-12 text-2xl
                                                    sm:h-14 sm:w-14 sm:text-3xl
                                                    md:h-16 md:w-16">
                                        📷
                                    </div>

                                    {isUploading ? (
                                        <>
                                            <div className="h-5 w-5
                                                            sm:h-6 sm:w-6
                                                            animate-spin rounded-full border-2
                                                            border-zinc-300 border-t-black" />
                                            <p className="text-sm sm:text-base font-medium">
                                                Fotoğraf yükleniyor...
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold">
                                                    Profil fotoğrafı yükle
                                                </h3>

                                                <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                                                    Sürükleyip bırak veya seçmek için tıkla
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="rounded-lg bg-black text-white font-medium
                                                            px-3 py-2 text-xs
                                                            sm:px-4 sm:text-sm"
                                            >
                                                Dosya Seç
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {previewUrl &&
                                <div className="mt-6">
                                    <div className="relative h-64 sm:h-80 md:h-96 w-full">
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
                            disabled={!selectedFile || isUploading || isDeleting}
                        >
                            {isUploading ? "Uploading..." : "Confirm"}
                        </Button>
                    </DialogContent>

                </Dialog>

                <Button className="bg-red-500 text-white rounded-full w-10 h-10 cursor-pointer"
                    onClick={deleteImage}
                    disabled={isDeleting || isUploading}>
                    <Trash />
                </Button>

            </div>




        </Card>
    )
}


export default AccountProfile
