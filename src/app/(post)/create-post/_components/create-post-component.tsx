'use client'

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { getCroppedImg } from "@/lib/cropImage"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import Cropper, { type Area } from "react-easy-crop"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

interface PhotoData {
    id: string
    file: File
    previewUrl: string
    stage2Crop: { x: number; y: number }
    stage3Crop: { x: number; y: number }
    zoom: number
    stage2Url: string | null // stage 3te gösterilen foto URLsi
    stage2Area: Area | null  // croppedAreaPixels -> stage 3'e geçerken kullanılcak olan foto için lazım
    stage3Area: Area | null  // croppedAreaPixels -> stage 3te birleşim foto parçalarını oluşturan foto için lazım 
    scoreColor: string
    scoreLocation: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

const CreatePostComponent = () => {

    const [stage, setStage] = useState<number>(1)
    const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
    const [photos, setPhotos] = useState<PhotoData[]>([])

    const [stage2NextButtonLoading, setStage2NextButtonLoading] = useState<boolean>(false)
    const [stage3NextButtonLoading, setStage3NextButtonLoading] = useState<boolean>(false)
    const [stage4PublishButtonLoading, setStage4PublishButtonLoading] = useState<boolean>(false)

    const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null)

    const [finalBlob, setFinalBlob] = useState<Blob | null>(null)
    const [finalUrl, setFinalUrl] = useState<string | null>(null)

    const [postMessage, setPostMessage] = useState("")

    //s2'den s3'e geçerken kullanıcı fotoda değişiklik yapıp yapmadığını anlamak için data saklamalık oluşturulan ref -> değişiklik yaptıysa önceki URLler revoke edilcek ve yeni area crop falan oluşcak
    const stage2CacheRef = useRef<Record<string, string>>({})
    //s3'den s4'e geçerken kullanıcı fotoda değişiklik yapıp yapmadığını anlamak için data saklamalık oluşturulan ref -> değişiklik yaptıysa önceki URLler revoke edilcek ve yeni area crop falan oluşcak
    const stage3CacheRef = useRef<string | null>(null)

    //component kapatırken url silmek için data saklama refi
    const urlsRef = useRef<{
        photos: PhotoData[]
        finalUrl: string | null
    }>({
        photos: [],
        finalUrl: null,
    })


    const imageCountFormSchema = z.object({
        imageCount: z
            .number()
            .int("Choose a whole number")
            .min(1, "Choose at least 1 photo.")
            .max(3, "Maximum 3 photos."),
        aspect: z.enum(["square", "portrait", "landscape"]),
        direction: z.enum(["horizontal", "vertical"]),
    })

    const { handleSubmit, ...imageCountForm } = useForm<z.infer<typeof imageCountFormSchema>>({
        resolver: zodResolver(imageCountFormSchema),
        defaultValues: {
            imageCount: 1,
            aspect: "portrait",
            direction: "vertical",
        },
    })

    const [imageCount, aspect, direction] = useWatch({
        control: imageCountForm.control,
        name: ["imageCount", "aspect", "direction"],
    })

    const previousAspect = useRef(aspect)

    const activePhoto = photos.find(
        photo => photo.id === activePhotoId
    )

    const aspectRatios = {
        square: 1,
        portrait: 4 / 5,
        landscape: 1.91,
    }
    //useEffect içinde aspect dependency için ->  ilk çağrıldığında da çalışıyor -> aynı değer olursa return ediyor direkt -> useRef ile bunu sağlıyoruz
    // asıl amacı multiple dependency useEffect içindi -> diğer dependencyler değişse bile aspect aynıysa return etsin
    const finalAspect = aspectRatios[aspect]

    const stage2CropAspect =
        direction === "horizontal"
            ? finalAspect
            : finalAspect

    const stage3CropAspect =
        direction === "horizontal"
            ? finalAspect * imageCount
            : finalAspect / imageCount

    const scoreLocationClasses = {
        "top-left": "top-2 left-2",
        "top-right": "top-2 right-2",
        "bottom-left": "bottom-2 left-2",
        "bottom-right": "bottom-2 right-2",
    }

    //Stage 2 veya Stage 3 hazırlanırken düzenleme alanlarını kilitlemek için
    const isPreparing = stage2NextButtonLoading || stage3NextButtonLoading || stage4PublishButtonLoading

    const onDrop = useCallback(async (selectedFiles: File[]) => {
        const fileCheck = selectedFiles[0]
        if (!fileCheck) return

        if (photos.length + selectedFiles.length > imageCount) {
            toast.error(`Maximum ${imageCount} photos`)
            return
        }

        try {
            for (const photo of selectedFiles) {
                setPhotos((prev) => {
                    return (
                        [
                            ...prev,
                            {
                                id: crypto.randomUUID(),
                                file: photo,
                                previewUrl: URL.createObjectURL(photo),
                                stage2Crop: { x: 0, y: 0 },
                                stage3Crop: { x: 0, y: 0 },
                                zoom: 1,
                                stage2Url: null,
                                stage2Area: null,
                                stage3Area: null,
                                scoreColor: "#ffffff",
                                scoreLocation: "top-right",
                            }
                        ]
                    )
                })
            }


        } catch (error) {
            toast.error(`${error} || error`)
        }


    }, [photos.length, imageCount])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
        multiple: true,
    })

    const swapPhotos = (targetPhotoId: string) => {
        if (!draggedPhotoId || draggedPhotoId === targetPhotoId) return

        setPhotos(prev => {
            const sourceIndex = prev.findIndex(photo => photo.id === draggedPhotoId)
            const targetIndex = prev.findIndex(photo => photo.id === targetPhotoId)

            if (sourceIndex === -1 || targetIndex === -1) return prev

            const updated = [...prev]

                //destructuring assignment kullanımı. 
                // Ayrı ayrı 2 satır yazmaya çalışsan -> updated[sourceIndex] = updated[targetIndex] dedin -> sonra target = source demek istesen -> ilk satırda source = target dedin yani source artık yok -> iki satırda yer değiştirmek için source datasını saklamak lazım ayrı
                // destructuring assignment kullanmadan yazımı altta
                // const sourcePhoto = updated[sourceIndex]
                // updated[sourceIndex] = updated[targetIndex]
                // updated[targetIndex] = sourcePhoto
                ;[updated[sourceIndex], updated[targetIndex]] = [
                    updated[targetIndex],
                    updated[sourceIndex],
                ]

            return updated
        })

        setDraggedPhotoId(null)
    }

    //kullanıcı stage2 ya da stage3te fotoya tıklamadıysa -> yani fotoya tıklayınca çalışan cropComplete çalışmadı ve stage2Area ya da stage3Area oluşmadıysa default oluşturmak için olan fonksiyon
    const getDefaultCropArea = (
        width: number,
        height: number,
        aspect: number
    ): Area => {
        const cropWidth = Math.min(width, height * aspect)
        const cropHeight = cropWidth / aspect

        return {
            x: Math.round((width - cropWidth) / 2),
            y: Math.round((height - cropHeight) / 2),
            width: Math.round(cropWidth),
            height: Math.round(cropHeight),
        }
    }

    const updatePhotoSettings = (
        updates: Partial<Pick<PhotoData, "scoreColor" | "scoreLocation">>
    ) => {
        setPhotos(prev =>
            prev.map(photo =>
                photo.id === activePhotoId
                    ? { ...photo, ...updates }
                    : photo
            )
        )
    }

    const onStage2CropComplete = useCallback(
        (_: any, croppedAreaPixels: Area) => {

            // console.log('croppedAreaPixels:', croppedAreaPixels)

            setPhotos(prev =>
                prev.map(photo =>
                    photo.id === activePhotoId
                        ? { ...photo, stage2Area: croppedAreaPixels }
                        : photo
                )
            )
            // setCroppedAreaPixels(croppedAreaPixels)
        },
        [activePhotoId]
    )

    const onStage3CropComplete = useCallback(
        (_: any, croppedAreaPixels: Area) => {



            setPhotos(prev =>
                prev.map(photo =>
                    photo.id === activePhotoId
                        ? { ...photo, stage3Area: croppedAreaPixels }
                        : photo
                )
            )
            // setCroppedAreaPixels(croppedAreaPixels)
        },
        [activePhotoId]
    )

    const stage1NextButtonOnClick = () => {
        try {
            if (photos.length !== imageCount) {
                throw new Error(`Please select ${imageCount} ${imageCount === 1 ? "photo" : "photos"}.`)
            }

            setActivePhotoId(photos[0].id)
            setStage(2)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to continue.")
        }
    }

    const stage2NextButtonOnClick = async () => {
        if (stage2NextButtonLoading || photos.length === 0) return
        setStage2NextButtonLoading(true)

        const createdStage2Urls: string[] = []

        try {
            //cache değişmiş mi ; ve değiştiyse S3 için photos update data hazırlama yeri
            const results = await Promise.allSettled(
                photos.map(async photo => {
                    const cache = JSON.stringify({
                        stage2Crop: photo.stage2Crop,
                        zoom: photo.zoom,
                    })

                    if (
                        photo.stage2Url &&
                        stage2CacheRef.current[photo.id] === cache
                    ) {
                        return { photo, cache } // crop ve zoom değiştirmeden next derse -> burdan eski haliyle return ediliyor
                    }

                    let area = photo.stage2Area

                    if (!area) {
                        //fotonun x ve y pixelini öğrenmek için image oluşturuyoruz -> default Area oluşturabilmek için
                        const image = new Image()
                        image.src = photo.previewUrl
                        await image.decode()//Fotoğrafın yüklenip tarayıcı tarafından çözümlenmesini(decode edilmesini) bekler.

                        area = getDefaultCropArea(
                            image.naturalWidth,
                            image.naturalHeight,
                            stage2CropAspect
                        )
                    }

                    const blob = await getCroppedImg(photo.previewUrl, area)
                    const stage2Url = URL.createObjectURL(blob)

                    createdStage2Urls.push(stage2Url)

                    return {
                        cache,
                        photo: {
                            ...photo,
                            stage2Url,
                            stage3Crop: { x: 0, y: 0 },
                            stage3Area: null,
                        },
                    }
                })
            )

            const updatedPhotos: PhotoData[] = []
            const updatedCache: Record<string, string> = {}

            //promise hata kontrol ve ; updated cache ve photo ayarlama yeri
            for (const result of results) {
                if (result.status === "rejected") {
                    throw result.reason
                }

                const { photo, cache } = result.value

                updatedPhotos.push(photo)
                updatedCache[photo.id] = cache
            }

            //promise hata dönmediyse ve her şey aynıysa direkt devam ediyo
            if (createdStage2Urls.length === 0) {
                setStage(3)
                return
            }

            //foto değiştiyse -> eski stage2Url silme yeri
            photos.forEach((photo, index) => {
                if (
                    photo.stage2Url &&
                    photo.stage2Url !== updatedPhotos[index].stage2Url
                ) {
                    URL.revokeObjectURL(photo.stage2Url)
                }
            })

            //S3 eski data silme yeri
            if (finalUrl) {
                URL.revokeObjectURL(finalUrl)
            }
            setFinalUrl(null)
            setFinalBlob(null)
            stage3CacheRef.current = null

            // S2 cache ve photos yenileme yeri
            stage2CacheRef.current = updatedCache
            setPhotos(updatedPhotos)
            setStage(3)
        } catch (error) {
            createdStage2Urls.forEach(url => URL.revokeObjectURL(url))

            toast.error("Failed to prepare photos.", {
                description: String(error),
            })
        } finally {
            setStage2NextButtonLoading(false)
        }
    }

    const stage3NextButtonOnClick = async () => {
        if (photos.length === 0 || stage3NextButtonLoading) return
        setStage3NextButtonLoading(true)
        try {
            const cache = JSON.stringify(
                {
                    direction: direction,
                    photos: photos.map(photo => ({
                        id: photo.id,
                        stage3Crop: photo.stage3Crop,
                    }))
                }
            )
            if (finalUrl && stage3CacheRef.current === cache) {
                setStage(4)
                return
            }


            const sources = await Promise.all(
                photos.map(async photo => {
                    if (!photo.stage2Url) {
                        throw new Error("Source image is missing.")
                    }

                    const image = new Image()
                    image.src = photo.stage2Url
                    await image.decode()

                    const area = photo.stage3Area ?? getDefaultCropArea(
                        image.naturalWidth,
                        image.naturalHeight,
                        stage3CropAspect
                    )

                    return { image, area }
                })
            )

            const canvas = document.createElement("canvas")
            canvas.width = 1080
            canvas.height = Math.round(1080 / finalAspect)

            const ctx = canvas.getContext("2d")

            if (!ctx) {
                throw new Error("Canvas is unavailable.")
            }

            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"

            sources.forEach(({ image, area }, index) => {
                const stacked = direction === "horizontal"

                const x = stacked
                    ? 0
                    : Math.round(index * canvas.width / sources.length)

                const y = stacked
                    ? Math.round(index * canvas.height / sources.length)
                    : 0

                const right = stacked
                    ? canvas.width
                    : Math.round((index + 1) * canvas.width / sources.length)

                const bottom = stacked
                    ? Math.round((index + 1) * canvas.height / sources.length)
                    : canvas.height

                ctx.drawImage(
                    image,
                    area.x,
                    area.y,
                    area.width,
                    area.height,
                    x,
                    y,
                    right - x,
                    bottom - y
                )
            })

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(result => {
                    if (result) {
                        resolve(result)
                    } else {
                        reject(new Error("Failed to create merged image."))
                    }
                }, "image/png")
            })

            const url = URL.createObjectURL(blob)

            if (finalUrl) {
                URL.revokeObjectURL(finalUrl)
            }

            stage3CacheRef.current = cache

            setFinalBlob(blob)
            setFinalUrl(url)
            setStage(4)
        } catch (error) {
            toast.error("Failed to prepare photos.", {
                description: String(error),
            })
        } finally {
            setStage3NextButtonLoading(false)
        }
    }

    const stage4PublishButtonOnClick = async () => {
        if (isPreparing) return
        setStage4PublishButtonLoading(true)
        try {
            if (!finalBlob || !finalUrl) {
                throw new Error("Prepare the merged image before publishing.")
            }

            if (photos.length === 0 || photos.length !== imageCount) {
                throw new Error(`Please select ${imageCount} photos.`)
            }

            const images = await Promise.all(
                photos.map(async photo => {
                    if (!photo.stage2Url) {
                        throw new Error("A photo is not ready for publishing.")
                    }

                    const response = await fetch(photo.stage2Url)

                    if (!response.ok) {
                        throw new Error("Failed to read a photo.")
                    }

                    const blob = await response.blob()

                    if (blob.size === 0) {
                        throw new Error("A photo is empty.")
                    }

                    return blob
                })
            )


            const metadata = {
                content: postMessage.trim(),
                direction,
                photos: photos.map((photo, index) => ({
                    position: index,
                    scoreColor: photo.scoreColor,
                    scoreLocation: photo.scoreLocation,
                })),
            }

            const formData = new FormData()

            formData.append("mergedImage", finalBlob, "merged.png")

            images.forEach((blob, index) => {
                formData.append("images", blob, `photo-${index + 1}.png`)
            })

            formData.append("metadata", JSON.stringify(metadata))

            const response = await fetch("/api/post/create-post", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)

                throw new Error(
                    typeof errorData?.error === "string"
                        ? errorData.error
                        : "Failed to publish post."
                )
            }

            toast.success("Post published successfully.")

        } catch (error) {
            toast.error("Failed to publish post.", {
                description: error instanceof Error
                    ? error.message
                    : String(error),
            })
        } finally {
            setStage4PublishButtonLoading(false)
        }
    }

    const stage2SetCrop = (crop: { x: number; y: number }) => {
        setPhotos(prev =>
            prev.map(photo =>
                photo.id === activePhotoId
                    ? { ...photo, stage2Crop: crop }
                    : photo
            )
        )
    }
    const stage3SetCrop = (crop: { x: number; y: number }) => {
        setPhotos(prev =>
            prev.map(photo =>
                photo.id === activePhotoId
                    ? { ...photo, stage3Crop: crop }
                    : photo
            )
        )
    }



    useEffect(() => {
        try {
            photos.forEach((photo, i) => {
                if (i >= imageCount) {
                    URL.revokeObjectURL(photo.previewUrl)
                    if (photo.stage2Url)
                        URL.revokeObjectURL(photo.stage2Url)
                }
            })
            setPhotos(prev =>
                prev.slice(0, imageCount).map(photo => ({
                    ...photo,
                    stage3Crop: { x: 0, y: 0 },
                    stage3Area: null,
                }))
            )

            if (finalUrl) {
                URL.revokeObjectURL(finalUrl)
            }
            setFinalBlob(null)
            setFinalUrl(null)

            setActivePhotoId(photos[0]?.id ?? null)
        } catch (error) {
            console.error('Failed to update image count.')

        }
    }, [imageCount])

    useEffect(() => {
        try {
            if (previousAspect.current === aspect) return

            previousAspect.current = aspect

            photos.forEach(photo => {
                if (photo.stage2Url) {
                    URL.revokeObjectURL(photo.stage2Url)
                }
            })

            if (finalUrl) {
                URL.revokeObjectURL(finalUrl)
            }

            setPhotos(prev =>
                prev.map(photo => ({
                    ...photo,
                    stage2Crop: { x: 0, y: 0 },
                    zoom: 1,
                    stage2Area: null,
                    stage2Url: null,
                    stage3Crop: { x: 0, y: 0 },
                    stage3Area: null,
                }))
            )

            setFinalBlob(null)
            setFinalUrl(null)
            setStage(1)
        } catch (error) {
            console.error('Failed to update aspect ratio.')
        }
    }, [aspect])

    useEffect(() => {
        try {
            if (finalUrl) {
                URL.revokeObjectURL(finalUrl)
            }

            setPhotos(prev =>
                prev.map(photo => ({
                    ...photo,
                    stage3Crop: { x: 0, y: 0 },
                    stage3Area: null,
                }))
            )

            setFinalBlob(null)
            setFinalUrl(null)
            // setStage(1)
        } catch (error) {
            console.error('Failed to update direction.')
        }
    }, [direction])

    useEffect(() => {
        urlsRef.current = { photos, finalUrl }
    }, [photos, finalUrl])

    useEffect(() => {
        return () => {
            const { photos, finalUrl } = urlsRef.current

            photos.forEach(photo => {
                URL.revokeObjectURL(photo.previewUrl)

                if (photo.stage2Url) {
                    URL.revokeObjectURL(photo.stage2Url)
                }
            })

            if (finalUrl) {
                URL.revokeObjectURL(finalUrl)
            }
        }
    }, [])

    return (

        <>
            <div className="mx-auto flex w-full max-w-2/3 flex-col gap-5 p-6">


                <div className=" border-2 border-pink-400 rounded-[20px] flex flex-col">

                    {stage === 1 &&
                        <>
                            <Field data-invalid={!!imageCountForm.formState.errors.imageCount}
                                className="p-4">
                                <FieldLabel htmlFor="imageCount">
                                    Image count
                                </FieldLabel>

                                <select className="rounded-md border p-2"
                                    disabled={isPreparing}
                                    {...imageCountForm.register("imageCount", { valueAsNumber: true })}>
                                    {[1, 2, 3].map((count) => (
                                        <option key={count} value={count}>
                                            {count}
                                        </option>
                                    ))}
                                </select>

                                {imageCountForm.formState.errors.imageCount && (
                                    <FieldError errors={[imageCountForm.formState.errors.imageCount]} />
                                )}

                            </Field>


                            <div
                                {...getRootProps()}
                                className={`
                    group cursor-pointer rounded-2xl border-2 border-dashed p-4
                    transition-all duration-200 ratio- w-1/4 max-w-[80%] aspect-square self-center
                    ${isDragActive
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                                    }
                `}
                            >
                                <input {...getInputProps()}
                                    className="" />

                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="flex items-center justify-center rounded-full bg-zinc-100
                                                    h-12 w-12 text-2xl
                                                    sm:h-14 sm:w-14 sm:text-3xl
                                                    md:h-16 md:w-16">
                                        📷
                                    </div>


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
                                            className="cursor-pointer rounded-lg bg-black text-white font-medium
                                                            px-3 py-2 text-xs
                                                            sm:px-4 sm:text-sm"
                                        >
                                            Dosya Seç
                                        </button>
                                    </>
                                </div>
                            </div>
                            {/* önizleme */}
                            <div className="flex gap-3 justify-center py-4">
                                {photos.map(photo =>
                                    <div key={photo.id}
                                        draggable
                                        onDragStart={event => {
                                            event.dataTransfer.effectAllowed = "move"
                                            event.dataTransfer.setData("text/plain", photo.id)
                                            setDraggedPhotoId(photo.id)
                                        }}
                                        onDragOver={event => {
                                            event.preventDefault()
                                            event.dataTransfer.dropEffect = "move"
                                        }}
                                        onDrop={event => {
                                            event.preventDefault()
                                            swapPhotos(photo.id)
                                        }}
                                        onDragEnd={() => setDraggedPhotoId(null)}
                                        onClick={() => setActivePhotoId(photo.id)}
                                        className={`relative h-30 w-30 cursor-grab active:cursor-grabbing ${draggedPhotoId === photo.id ? "opacity-50" : ""
                                            }`}>
                                        <div className="h-full w-full overflow-hidden rounded-lg border-2">
                                            <img
                                                src={photo.previewUrl}
                                                alt="Photo preview"
                                                draggable={false}  //false yapınca süreklerken resim önizleme açılmıyo 
                                                className=" w-full h-full  object-contain scale-125 border"
                                                onClick={() => { setActivePhotoId(photo.id); console.log(`photo id:, ${photo.id}`) }
                                                }
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="Remove photo"
                                            onClick={event => {
                                                event.stopPropagation()

                                                const remainingPhotos = photos.filter(item => item.id !== photo.id)

                                                setPhotos(remainingPhotos)

                                                if (activePhotoId === photo.id) {
                                                    setActivePhotoId(remainingPhotos[0]?.id ?? null)
                                                }

                                                URL.revokeObjectURL(photo.previewUrl)

                                                if (photo.stage2Url) {
                                                    URL.revokeObjectURL(photo.stage2Url)
                                                }

                                                delete stage2CacheRef.current[photo.id]

                                                if (finalUrl) {
                                                    URL.revokeObjectURL(finalUrl)
                                                }

                                                setFinalUrl(null)
                                                setFinalBlob(null)
                                                stage3CacheRef.current = null
                                            }}
                                            className="absolute right-1 top-1 z-10 flex size-5 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-red-500 p-0 text-white shadow-sm transition-colors hover:bg-red-600"
                                        >
                                            <X className="size-3" strokeWidth={2} />
                                        </button>
                                    </div>
                                )}

                            </div>

                            <div className="flex self-end pr-2 gap-1">
                                <Button
                                    disabled={true}>
                                    Back
                                </Button>
                                <Button
                                    onClick={stage1NextButtonOnClick}
                                    disabled={isPreparing}>
                                    Next
                                </Button>


                            </div>
                        </>
                    }

                    {stage === 2 &&


                        <div className="flex flex-col w-full">
                            <Field className="p-4">
                                <FieldLabel htmlFor="aspect">Aspect ratio</FieldLabel>
                                <select
                                    id="aspect"
                                    disabled={isPreparing}
                                    className="rounded-md border p-2"
                                    {...imageCountForm.register("aspect")}
                                >
                                    <option value="square">Square (1:1)</option>
                                    <option value="portrait">Portrait (4:5)</option>
                                    <option value="landscape">Landscape (1.91:1)</option>
                                </select>
                            </Field>

                            <div inert={isPreparing} aria-busy={isPreparing} className="flex flex-row w-full justify-center gap-4 items-center py-4">

                                {activePhoto &&
                                    <div className="flex flex-col w-1/3 items-center justify-center">
                                        <div className="relative h-64 sm:h-80 md:h-96 w-48 sm:w-60 md:w-72">
                                            <Cropper
                                                image={activePhoto.previewUrl}
                                                crop={activePhoto.stage2Crop}
                                                zoom={activePhoto.zoom}
                                                aspect={stage2CropAspect}
                                                cropShape="rect"
                                                showGrid={false}
                                                onCropChange={stage2SetCrop}
                                                onCropComplete={onStage2CropComplete}
                                            />
                                        </div>

                                        <input
                                            type="range"
                                            disabled={isPreparing}
                                            min={1}
                                            max={3}
                                            step={0.04}
                                            value={activePhoto.zoom}
                                            onChange={(e) =>
                                                setPhotos(prev => {
                                                    return (
                                                        prev.map(photo =>
                                                            photo.id === activePhotoId
                                                                ? { ...photo, zoom: Number(e.target.value) }
                                                                : photo
                                                        )
                                                    )
                                                })
                                            }
                                            className="mt-4 w-full"
                                        />
                                    </div>
                                }


                            </div>
                            {/* önizleme */}
                            <div inert={isPreparing} aria-busy={isPreparing} className="flex gap-3 justify-center py-2">
                                {photos.map(photo =>
                                    <div key={photo.id}
                                        draggable
                                        onDragStart={event => {
                                            event.dataTransfer.effectAllowed = "move"
                                            event.dataTransfer.setData("text/plain", photo.id)
                                            setDraggedPhotoId(photo.id)
                                        }}
                                        onDragOver={event => {
                                            event.preventDefault()
                                            event.dataTransfer.dropEffect = "move"
                                        }}
                                        onDrop={event => {
                                            event.preventDefault()
                                            swapPhotos(photo.id)
                                        }}
                                        onDragEnd={() => setDraggedPhotoId(null)}
                                        onClick={() => setActivePhotoId(photo.id)}
                                        className={`h-20 w-20 cursor-grab overflow-hidden border-2 active:cursor-grabbing ${draggedPhotoId === photo.id ? "opacity-50" : ""
                                            }`}>
                                        <img
                                            src={photo.previewUrl}
                                            alt="Photo preview"
                                            draggable={false}
                                            className=" w-full h-full  object-contain scale-200 border"
                                            onClick={() => { setActivePhotoId(photo.id); console.log(`photo id:, ${photo.id}`) }
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex self-end pr-2 gap-1">
                                <Button
                                    onClick={() => {
                                        setStage(prev => prev - 1)
                                        setActivePhotoId(photos[0].id)
                                    }
                                    }
                                    disabled={isPreparing}>
                                    Back
                                </Button>
                                <Button
                                    onClick={stage2NextButtonOnClick}
                                    disabled={photos.length === 0 || isPreparing}>
                                    Next
                                </Button>


                            </div>
                        </div>
                    }
                    {stage === 3 && !stage2NextButtonLoading &&
                        <div className="flex flex-col w-full">
                            <Field className="p-4">
                                <FieldLabel htmlFor="direction">Split direction</FieldLabel>
                                <select
                                    id="direction"
                                    disabled={isPreparing}
                                    className="rounded-md border p-2"
                                    {...imageCountForm.register("direction")}
                                >
                                    <option value="horizontal">Horizontal</option>
                                    <option value="vertical">Vertical</option>
                                </select>
                            </Field>

                            <div inert={isPreparing} aria-busy={isPreparing} className="flex flex-row w-full justify-center gap-4 items-center py-4">

                                {activePhoto && activePhoto.stage2Url &&
                                    <div className="flex flex-col w-1/3 items-center justify-center">
                                        <div className="relative h-64 sm:h-80 md:h-96 w-48 sm:w-60 md:w-72">
                                            <Cropper
                                                image={activePhoto.stage2Url}
                                                crop={activePhoto.stage3Crop}
                                                zoom={1}
                                                aspect={stage3CropAspect}
                                                cropShape="rect"
                                                showGrid={false}
                                                onCropChange={stage3SetCrop}
                                                onCropComplete={onStage3CropComplete}
                                                zoomWithScroll={false}
                                            />
                                        </div>

                                    </div>
                                }


                            </div>

                            {/* önizleme */}
                            <div inert={isPreparing} aria-busy={isPreparing} className="flex gap-3 justify-center py-2 relative">
                                {photos.map(photo => photo.stage2Url

                                    ? <div key={photo.id}
                                        draggable
                                        onDragStart={event => {
                                            event.dataTransfer.effectAllowed = "move"
                                            event.dataTransfer.setData("text/plain", photo.id)
                                            setDraggedPhotoId(photo.id)
                                        }}
                                        onDragOver={event => {
                                            event.preventDefault()
                                            event.dataTransfer.dropEffect = "move"
                                        }}
                                        onDrop={event => {
                                            event.preventDefault()
                                            swapPhotos(photo.id)
                                        }}
                                        onDragEnd={() => setDraggedPhotoId(null)}
                                        onClick={() => setActivePhotoId(photo.id)}
                                        className={`h-20 w-20 cursor-grab overflow-hidden border-2 active:cursor-grabbing ${draggedPhotoId === photo.id ? "opacity-50" : ""
                                            }`}>
                                        <img
                                            src={photo.stage2Url}
                                            alt="Photo preview"
                                            draggable={false}
                                            className=" w-full h-full  object-contain scale-200 border"
                                            onClick={() => { setActivePhotoId(photo.id); console.log(`photo id:, ${photo.id}`) }
                                            }
                                        />
                                    </div>
                                    : null
                                )}

                            </div>

                            <div className="flex self-end pr-2 gap-1">
                                <Button
                                    onClick={() => {
                                        setStage(prev => prev - 1)
                                        setActivePhotoId(photos[0].id)
                                    }
                                    }
                                    disabled={isPreparing}>
                                    Back
                                </Button>
                                <Button
                                    onClick={stage3NextButtonOnClick}
                                    disabled={isPreparing}>
                                    Next
                                </Button>


                            </div>
                        </div>
                    }

                    {stage === 4 && !stage3NextButtonLoading &&
                        <div className="flex w-full flex-col gap-4 p-4">
                            <div inert={isPreparing} className="flex gap-2" role="tablist" aria-label="Photo settings">
                                {photos.map((photo, index) => (
                                    <button
                                        key={photo.id}
                                        id={`photo-tab-${photo.id}`}
                                        type="button"
                                        role="tab"
                                        aria-selected={activePhotoId === photo.id}
                                        aria-controls="photo-settings-panel"
                                        onClick={() => setActivePhotoId(photo.id)}
                                        className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activePhotoId === photo.id
                                            ? "bg-black text-white"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                            }`}
                                    >
                                        Photo {index + 1}
                                    </button>
                                ))}
                            </div>

                            {activePhoto && (
                                <div
                                    inert={isPreparing}
                                    id="photo-settings-panel"
                                    role="tabpanel"
                                    aria-labelledby={`photo-tab-${activePhoto.id}`}
                                    className="flex flex-col gap-4"
                                >
                                    <Field>
                                        <FieldLabel htmlFor="score-color">Score color</FieldLabel>
                                        <input
                                            id="score-color"
                                            type="color"
                                            value={activePhoto.scoreColor}
                                            onChange={event =>
                                                updatePhotoSettings({ scoreColor: event.target.value })
                                            }
                                            className="h-10 w-16 cursor-pointer rounded-md border p-1"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="score-location">
                                            Score location
                                        </FieldLabel>
                                        <select
                                            id="score-location"
                                            value={activePhoto.scoreLocation}
                                            onChange={event =>
                                                updatePhotoSettings({
                                                    scoreLocation: event.target.value as PhotoData["scoreLocation"],
                                                })
                                            }
                                            className="w-full rounded-md border p-2"
                                        >
                                            <option value="top-left">Top left</option>
                                            <option value="top-right">Top right</option>
                                            <option value="bottom-left">Bottom left</option>
                                            <option value="bottom-right">Bottom right</option>
                                        </select>
                                    </Field>
                                </div>
                            )}

                            <div className=" relative w-2/5 self-center my-4">
                                {finalUrl && (
                                    <>
                                        <img
                                            src={finalUrl}
                                            alt="Merged preview"
                                            className="block h-auto w-full"
                                        />
                                        <div
                                            className={`pointer-events-none absolute inset-0 flex 
                                                ${direction === "horizontal" ? "flex-col" : "flex-row"}`}
                                        >
                                            {photos.map(photo => (
                                                <div key={photo.id} className="relative min-h-0 min-w-0 flex-1">
                                                    <p
                                                        className={`absolute m-0 text-xl font-bold ${scoreLocationClasses[photo.scoreLocation]
                                                            }`}
                                                        style={{ color: photo.scoreColor }}
                                                    >
                                                        2.8
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                    </>

                                )}
                            </div>

                            <Field>
                                <FieldLabel htmlFor="post-message">Post message</FieldLabel>
                                <textarea
                                    inert={isPreparing}
                                    id="post-message"
                                    value={postMessage}
                                    onChange={event => setPostMessage(event.target.value)}
                                    placeholder="Write a message or add hashtags..."
                                    rows={4}
                                    className="w-full resize-y rounded-md border p-3"
                                />
                            </Field>

                            <div className="flex self-end pr-2 gap-1">
                                <Button
                                    onClick={() => {
                                        setStage(prev => prev - 1)
                                        setActivePhotoId(photos[0].id)
                                    }
                                    }
                                    disabled={stage4PublishButtonLoading}>
                                    Back
                                </Button>
                                <Button
                                    onClick={stage4PublishButtonOnClick}
                                    disabled={stage4PublishButtonLoading}>
                                    Publish
                                </Button>


                            </div>
                        </div>
                    }

                </div>



            </div>
        </>
    )
}


export default CreatePostComponent
