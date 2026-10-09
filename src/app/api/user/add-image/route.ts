import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"
import { deleteUnusedCloudinaryImage } from "@/jobs/producers/user"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


//deleteUnusedCloudinaryImage 3 kere kullanılcak -> her birinde tek tek try catch uğraşmamak için dışarıda bu fonksiyon yazdım
async function scheduleImageCleanup(publicId: string) {
    try {
        await deleteUnusedCloudinaryImage(publicId)
    } catch (error) {
        console.error("Image cleanup queue failed:", {
            publicId,
            error,
        })
    }
}


export async function POST(req: Request) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true },
    })

    if (!user) {
        return Response.json(
            { error: "User not found" },
            { status: 404 }
        )
    }

    const oldPublicId = user.image

    const formData = await req.formData()
    const file = formData.get("file")

    console.log('body:', file)

    if (!(file instanceof File)) {
        return Response.json({
            success: false, error: 'image file missing'
        },
            { status: 400 })
    }

    if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size === 0 ||
        file.size > 5 * 1024 * 1024
    ) {
        return Response.json(
            { error: "PNG, JPEG or WebP; max 5 MB" },
            { status: 400 }
        )
    }



    const buffer = Buffer.from(await file.arrayBuffer())

    let uploaded: UploadApiResponse

    try {
        uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "image",
                    folder: `profile-images`,
                    allowed_formats: ["png", "jpg", "jpeg", "webp"],
                },
                (error, result) => {
                    if (error) {
                        reject(error)
                        return
                    }

                    if (!result) {
                        reject(new Error("Cloudinary result empty"))
                        return
                    }

                    resolve(result)
                }
            )

            stream.on("error", reject)
            //üstteki kısa hali rejectin
            // stream.on("error", (error) => {
            //     reject(error)
            // })

            stream.end(buffer)
        })
    } catch (error) {
        console.error("Cloudinary upload error:", error)

        return Response.json(
            { error: "failed to upload image" },
            { status: 502 }
        )
    }

    const publicId = uploaded.public_id //secure_url verince cldimage çalışmıyor, public_id istiyor

    const userId = session.user.id

    let updatedCount: number

    try {
        const updated = await prisma.user.updateMany({
            where: {
                id: userId,
                image: oldPublicId,
            },
            data: {
                image: publicId,
            },
        })
        //updatedCount değiştirme ->
        // Başta okuduğun PP: A
        // Yüklediğin yeni PP: B

        // DB hâlâ A ise → B yapılır → count: 1
        // DB başka işlemle C olduysa → dokunulmaz → count: 0
        updatedCount = updated.count
    } catch (error) {
        console.error("DB image update failed:", error)

        try {
            const references = await prisma.user.count({
                where: { image: publicId },
            })

            if (references === 0) {
                const result = await cloudinary.uploader.destroy(publicId, {
                    invalidate: true,
                })
                if (result.result !== "ok" && result.result !== "not found") {
                    throw new Error(`Cloudinary delete failed: ${result.result}`)
                }
            }
        } catch (cleanupError) {
            console.error("New image cleanup failed:", cleanupError)
            await scheduleImageCleanup(publicId)
        }

        return Response.json(
            { error: "Failed to upload image" },
            { status: 500 }
        )
    }

    // Alt kısım -> aynı anda 2 PP yüklendiği tespit edilirse -> öncedencloudinary'ye yükleneni cloudinaryden silmek için
    if (updatedCount === 0) {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                invalidate: true,
            })

            if (result.result !== "ok" && result.result !== "not found") {
                throw new Error(`Cloudinary delete failed: ${result.result}`)
            }
        } catch (error) {
            console.error("Unused image cleanup failed:", error)
            await scheduleImageCleanup(publicId)
        }

        return Response.json(
            { error: "Profil görseli değişti; tekrar dene" },
            { status: 409 }
        )
    }

    if (
        oldPublicId &&
        oldPublicId !== publicId
    ) {
        try {
            const result = await cloudinary.uploader.destroy(oldPublicId, {
                invalidate: true,
            })

            if (result.result !== "ok" && result.result !== "not found") {
                throw new Error(`Cloudinary delete failed: ${result.result}`)
            }
        } catch (error) {
            console.error("Failed to delete old picture:", error)
            await scheduleImageCleanup(oldPublicId)
        }
    }

    return Response.json({
        error: null
    },
        { status: 200 })
}
