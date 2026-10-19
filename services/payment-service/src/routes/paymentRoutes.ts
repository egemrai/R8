import { Router } from "express"
import * as paymentController from "../controllers/paymentController"
import { requireGateway } from "../middlewares/requireGateway"

const router = Router()

router.get("/health", paymentController.health)

router.get("/me", requireGateway, paymentController.me)

router.post("/create-wallet", requireGateway, paymentController.createWallet)
router.get("/get-wallet", requireGateway, paymentController.getWallet)

router.post("/create-payment", requireGateway, paymentController.createPayment)

router.post("/confirm-test-payment", requireGateway, paymentController.confirmTestPayment)
export default router
