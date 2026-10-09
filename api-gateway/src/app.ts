import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"

const app = express()

app.use(express.json())

app.use(
    "/api/payments",
    createProxyMiddleware({
        target: `${process.env.NODE_ENV === "production" ? "http://payment-service:5001" : "http://payment-service:5001"}`,
        changeOrigin: true
    })
)

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "api-gateway"
    })
})

export default app