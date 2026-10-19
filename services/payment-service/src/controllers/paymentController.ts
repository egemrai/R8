import type { RequestHandler } from "express"
import { prisma } from "../lib/prisma"

export const health: RequestHandler = (req, res) => {
    res.json({
        service: "payment-service",
        status: "ok",
    })
}

export const me: RequestHandler = (req, res) => {
    res.json({
        service: "payment-service",
        userId: res.locals.userId,
    })
}

export const createWallet: RequestHandler = async (req, res) => {
    const userId = res.locals.userId as string

    const wallet = await prisma.wallet.upsert({
        where: {
            userId,
        },
        create: {
            userId,
        },
        update: {},
    })
    //     upsert ne yapıyor ?
    //         - Bu userId için cüzdan yoksa oluşturur.
    // - Varsa mevcut cüzdanı döndürür.
    // - update: { } olduğu için mevcut bakiyeyi değiştirmez.
    // - Şemadaki varsayılanlarla bakiye 0, para birimi "USD" olur.
    // Aynı isteği tekrar göndermek ikinci bir cüzdan oluşturmaz.

    res.status(200).json({ wallet })
}

export const getWallet: RequestHandler = async (req, res) => {
    const userId = res.locals.userId as string

    const wallet = await prisma.wallet.findUnique({
        where: {
            userId,
        },
    })

    if (!wallet) {
        res.status(404).json({ error: "Wallet not found" })
        return
    }

    res.json({ wallet })
}

export const createPayment: RequestHandler = async (req, res) => {
    const userId = res.locals.userId as string
    const amountCents = req.body?.amountCents

    if (
        typeof amountCents !== "number" ||
        ![1000, 2000, 5000].includes(amountCents)
    ) {
        res.status(400).json({
            error: "Choose 10, 20 or 50 USD",
        })
        return
    }

    const wallet = await prisma.wallet.upsert({
        where: { userId },
        create: { userId },
        update: {},
    })

    const payment = await prisma.payment.create({
        data: {
            walletId: wallet.id,
            amountCents,
        },
    })

    res.status(201).json({ payment })
}

// Fonksiyonun akışı: kullanıcının ödemesini bul → hâlâ pending ise completed yap → yalnızca geçiş başarılıysa bakiyeyi artır → güncel cüzdanı döndür.
// Tekrar onaylanırsa bakiye yeniden artmaz.
export const confirmTestPayment: RequestHandler = async (req, res) => {
    const userId = res.locals.userId as string
    const paymentId = req.body?.paymentId

    if (typeof paymentId !== "string" || !paymentId.trim()) {
        res.status(400).json({ error: "Payment ID is required" })
        return
    }


    //     prisma.$transaction(...): İçindeki DB işlemleri birlikte başarılı olur. Biri hata verirse hepsi geri alınır.
    // tx: Transaction’a bağlı Prisma Client. İçeride prisma yerine bunu kullanıyoruz.
    // id: paymentId: Ödemenin kendi alanını filtreliyor.
    // wallet: { userId }: İlişkili cüzdanı filtreliyor. “Bu ödeme, giriş yapan kullanıcının cüzdanına mı bağlı?” kontrolü. { userId }, { userId: userId } kısaltmasıdır.
    // findUniqueOrThrow: Tek kaydı getirir; bulunamazsa null dönmek yerine hata fırlatır.
    const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
            where: {
                id: paymentId,
                wallet: { userId },
            },
        })

        if (!payment) return null

        const updated = await tx.payment.updateMany({
            where: {
                id: payment.id,
                status: "pending",
            },
            data: {
                status: "completed",
                completedAt: new Date(),
            },
        })

        // Yalnızca pending → completed geçişini yapan istek para ekler.
        if (updated.count === 1) {
            await tx.wallet.update({
                where: { id: payment.walletId },
                data: {
                    balanceCents: {
                        increment: payment.amountCents,
                    },
                },
            })
        }

        // findUniqueOrThrow: Tek kaydı getirir; bulunamazsa null dönmek yerine hata fırlatır.
        const wallet = await tx.wallet.findUniqueOrThrow({
            where: { id: payment.walletId },
        })

        return {
            wallet,
            alreadyCompleted: updated.count === 0,
        }
    })

    if (!result) {
        res.status(404).json({ error: "Payment not found" })
        return
    }

    res.json({
        paymentId,
        status: "completed",
        ...result,
    })
}