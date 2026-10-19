import type { RequestHandler } from "express"

export const requireAuth: RequestHandler = async (req, res, next) => {
    const cookie = req.headers.cookie

    if (!cookie) {
        res.status(401).json({ error: "Unauthorized" })
        return
    }

    const authServiceUrl = process.env.AUTH_SERVICE_URL

    if (!authServiceUrl) {
        res.status(503).json({ error: "Auth service is not configured" })
        return
    }

    try {
        const response = await fetch(
            `${authServiceUrl}/api/auth/get-session`,
            {
                headers: {
                    Cookie: cookie,
                },
                signal: AbortSignal.timeout(5000),
            }
        )

        if (!response.ok) {
            res.status(503).json({ error: "Session verification failed" })
            return
        }

        const session = await response.json()

        if (!session?.user?.id || !session?.session) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        // Yalnızca sunucunun doğruladığı kullanıcı bilgisi.
        res.locals.userId = session.user.id

        next()
    } catch (error) {
        console.error("Auth service request failed:", error)

        res.status(503).json({ error: "Auth service unavailable" })
    }
}