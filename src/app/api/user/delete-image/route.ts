import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {

    const { publicId } = await req.json()

    await cloudinary.uploader.destroy(publicId)

    return Response.json({
        success: true,
    })
}