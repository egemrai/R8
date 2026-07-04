import { ZodError } from "zod"

export async function apiHandler(
    callback: () => Promise<Response>
) {
    try {
        console.log('apiHandler1')
        return await callback()

    } catch (error) {
        console.log('apiHandler2')
        console.error(error)

        if (error instanceof ZodError) {
            return Response.json(
                {
                    error: "Validation failed",
                    details: error.flatten(),
                },
                { status: 400 }
            )
        }

        return Response.json(
            {
                error: "Internal server error",
            },
            {
                status: 500,
            }
        )
    }
}