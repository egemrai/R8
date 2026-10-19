import express from "express"
import paymentRoutes from "./routes/paymentRoutes"
import type { ErrorRequestHandler } from "express"


const app = express()

app.use(express.json())

app.use("/api/payment", paymentRoutes)




const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.error("Payment service error:", error)

    if (res.headersSent) {
        next(error)
        return
    }

    res.status(500).json({ error: "Internal server error" })
}

app.use(errorHandler)


export default app
