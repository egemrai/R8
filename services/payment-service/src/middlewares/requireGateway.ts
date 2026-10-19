import type { RequestHandler } from "express"

const gatewaySecret = process.env.GATEWAY_SECRET

if (!gatewaySecret) {
    throw new Error("GATEWAY_SECRET is required")
}

export const requireGateway: RequestHandler = (req, res, next) => {
    if (req.get("X-Gateway-Secret") !== gatewaySecret) {
        res.status(403).json({ error: "Forbidden" })
        return
    }

    const userId = req.get("X-User-Id")

    if (!userId) {
        res.status(401).json({ error: "Missing user identity" })
        return
    }

    res.locals.userId = userId

    next()
}