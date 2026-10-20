import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"
import { z } from "zod"

export const runtime = "nodejs"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const scoreLocations = {
    "top-left": "topLeft",
    "top-right": "topRight",
    "bottom-left": "bottomLeft",
    "bottom-right": "bottomRight",
} as const

const metadataSchema = z.object({
    content: z.string().trim().max(2200),
    direction: z.enum(["horizontal", "vertical"]),
    photos: z.array(
        z.object({
            position: z.number().int().min(0).max(2),
            scoreColor: z.string().regex(/^#[0-9a-f]{6}$/i),
            scoreLocation: z.enum([
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
            ]),
        })
    ).min(1).max(3),
})

const maxFileSize = 10 * 1024 * 1024
const allowedTypes = ["image/png", "image/jpeg", "image/webp"]

// Dosyayı Cloudinary'ye yükler ve yükleme bilgilerini döndürür.
async function uploadImage(file: File): Promise<UploadApiResponse> {
    const buffer = Buffer.from(await file.arrayBuffer())

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "image",
                folder: "post-images",
                allowed_formats: ["png", "jpg", "jpeg", "webp"],
            },
            (error, result) => {
                if (error) {
                    reject(error)
                    return
                }

                if (!result) {
                    reject(new Error("Cloudinary result is empty."))
                    return
                }

                resolve(result)
            }
        )

        stream.on("error", reject)
        stream.end(buffer)
    })
}

// Yalnızca veritabanında kullanılmayan yüklemeleri temizler.
async function cleanupUploads(uploads: UploadApiResponse[]) {
    await Promise.all(
        uploads.map(async upload => {
            try {
                const [mergedImage, image] = await Promise.all([
                    prisma.postMergedImage.findUnique({
                        where: { publicId: upload.public_id },
                        select: { id: true },
                    }),
                    prisma.postImage.findFirst({
                        where: { publicId: upload.public_id },
                        select: { id: true },
                    }),
                ])

                if (mergedImage || image) return

                const result = await cloudinary.uploader.destroy(
                    upload.public_id,
                    { resource_type: "image", invalidate: true }
                )

                if (result.result !== "ok" && result.result !== "not found") {
                    throw new Error("Cloudinary cleanup failed.")
                }
            } catch (error) {
                console.error("Post image cleanup failed:", {
                    publicId: upload.public_id,
                    error,
                })
            }
        })
    )
}

export const POST = async (req: Request) => {
    const uploadedImages: UploadApiResponse[] = []

    try {
        // Kullanıcı kimliğini istemciden değil, oturumdan alır.
        const session = await auth.api.getSession({
            headers: req.headers,
        })

        if (!session) {
            return Response.json(
                { error: "Unauthorized." },
                { status: 401 }
            )
        }

        let formData: FormData

        try {
            formData = await req.formData()
        } catch {
            return Response.json(
                { error: "Invalid form data." },
                { status: 400 }
            )
        }

        const metadataRaw = formData.get("metadata")

        if (typeof metadataRaw !== "string") {
            return Response.json(
                { error: "Metadata is missing." },
                { status: 400 }
            )
        }

        let metadataValue: unknown

        try {
            metadataValue = JSON.parse(metadataRaw)
        } catch {
            return Response.json(
                { error: "Metadata must be valid JSON." },
                { status: 400 }
            )
        }


        // safeParse, verinin Zod şemasındaki kurallara uyup uymadığını kontrol eder.
        // Doğruysa → parsed.success true, doğrulanmış veri parsed.data içinde.
        // Yanlışsa → parsed.success false, hatalar parsed.error içinde.
        const parsed = metadataSchema.safeParse(metadataValue)

        if (!parsed.success) {
            return Response.json(
                {
                    error: "Invalid post metadata.",
                    details: z.treeifyError(parsed.error),
                },
                { status: 400 }
            )
        }

        const metadata = parsed.data
        const mergedImage = formData.get("mergedImage")
        const postImages = formData.getAll("images")

        if (
            !(mergedImage instanceof File) ||
            postImages.length !== metadata.photos.length ||
            !postImages.every(image => image instanceof File)
        ) {
            return Response.json(
                { error: "Image files do not match the photo metadata." },
                { status: 400 }
            )
        }

        // Metadata sırasının dosya sırasıyla birebir eşleşmesini zorunlu tutar.
        if (metadata.photos.some((photo, index) => photo.position !== index)) {
            return Response.json(
                { error: "Invalid photo order." },
                { status: 400 }
            )
        }

        const files = [mergedImage, ...postImages]

        if (
            files.some(file =>
                !allowedTypes.includes(file.type) ||
                file.size === 0 ||
                file.size > maxFileSize
            )
        ) {
            return Response.json(
                { error: "Use PNG, JPEG or WebP images up to 10 MB each." },
                { status: 400 }
            )
        }

        // Hepsi tamamlanana kadar bekler; kısmi başarıda yüklenenler temizlenebilir.
        const uploadResults = await Promise.allSettled(
            files.map(file => uploadImage(file))
        )

        for (const result of uploadResults) {
            if (result.status === "fulfilled") {
                uploadedImages.push(result.value)
            }
        }

        if (uploadResults.some(result => result.status === "rejected")) {
            await cleanupUploads(uploadedImages)

            console.error("Post image upload failed:", uploadResults.filter(
                result => result.status === "rejected"
            ))

            return Response.json(
                { error: "Failed to upload images." },
                { status: 502 }
            )
        }

        // İlk dosya birleşimdir; kalanlar ayrı slaytlardır.
        const [mergedUpload, ...photoUploads] = uploadedImages

        // Nested create, gönderi ve ilişkili görselleri tek transaction'da kaydeder.
        const post = await prisma.post.create({
            data: {
                authorId: session.user.id,
                content: metadata.content || null,
                direction: metadata.direction,
                mergedImage: {
                    create: {
                        publicId: mergedUpload.public_id,
                        secureUrl: mergedUpload.secure_url,
                        width: mergedUpload.width,
                        height: mergedUpload.height,
                    },
                },
                images: {
                    create: photoUploads.map((upload, index) => ({
                        publicId: upload.public_id,
                        secureUrl: upload.secure_url,
                        width: upload.width,
                        height: upload.height,
                        position: index,
                        scoreColor: metadata.photos[index].scoreColor,
                        scoreLocation:
                            scoreLocations[metadata.photos[index].scoreLocation],
                    })),
                },
            },
            select: { id: true },
        })

        return Response.json(
            { postId: post.id },
            { status: 201 }
        )
    } catch (error) {
        console.error("Failed to create post:", error)

        await cleanupUploads(uploadedImages)

        return Response.json(
            { error: "Failed to create post." },
            { status: 500 }
        )
    }
}