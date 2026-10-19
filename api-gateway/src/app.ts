import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { requireAuth } from "./middlewares/requireAuth"
import type { Request, Response } from "express"

const app = express()

const paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL ?? "http://127.0.0.1:5001"

const gatewaySecret = process.env.GATEWAY_SECRET

if (!gatewaySecret) {
    throw new Error("GATEWAY_SECRET is required")
}

app.use(
    "/api/payment",
    requireAuth,
    createProxyMiddleware<Request, Response>({
        target: `${paymentServiceUrl}/api/payment`,
        changeOrigin: true,
        proxyTimeout: 10000,
        logger: console,

        on: {
            proxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader("X-User-Id", res.locals.userId)
                proxyReq.setHeader("X-Gateway-Secret", gatewaySecret)

                // Payment service'in session cookie'sine ihtiyacı yok.
                proxyReq.removeHeader("Cookie")
            },
        },
    })
)

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "api-gateway"
    })
})

export default app
