"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Payment = {
    id: string
    amountCents: number
    status: "pending" | "completed"
}

export default function PaymentPage() {
    const [amountCents, setAmountCents] = useState(1000)
    const [payment, setPayment] = useState<Payment | null>(null)
    const [balanceCents, setBalanceCents] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [walletIsLoading, setWalletIsLoading] = useState(true)
    const [error, setError] = useState("")

    async function createPayment() {
        if (isLoading || walletIsLoading || payment) return

        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/payment/create-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amountCents }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error ?? "Failed to create payment")
            }

            setPayment(data.payment)
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Something went wrong"
            )
        } finally {
            setIsLoading(false)
        }
    }

    async function confirmPayment() {
        if (!payment ||
            payment.status === "completed" ||
            isLoading ||
            walletIsLoading) return

        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/payment/confirm-test-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paymentId: payment.id,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error ?? "Failed to confirm payment")
            }

            setBalanceCents(data.wallet.balanceCents)
            setPayment({ ...payment, status: "completed" })
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Something went wrong"
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const loadWallet = async () => {
            setWalletIsLoading(true)
            try {
                const res = await fetch('/api/payment/create-wallet', {
                    method: "POST",
                })
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error ?? "Failed to load wallet")
                }

                setBalanceCents(data.wallet.balanceCents)
            } catch (error) {
                toast.error("Failed to load wallet.", {
                    description: String(error || 'Failed to load wallet'),
                })
            } finally {
                setWalletIsLoading(false)
            }


        }

        loadWallet()
    }, [])

    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 p-6">
            {walletIsLoading ? (
                <span>Wallet loading...</span>
            ) : balanceCents !== null ? (
                <span className="text-2xl font-semibold">
                    Current balance: {(balanceCents / 100).toFixed(2)} USD
                </span>
            ) : (
                <span>Balance unavailable</span>
            )}
            <h1 className="text-2xl font-semibold">Add funds</h1>

            {
                !payment && (
                    <>
                        <div className="flex gap-3">
                            {[1000, 2000, 5000].map((amount) => (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    className={amountCents === amount ? "bg-blue-400" : ""}
                                    aria-pressed={amountCents === amount}
                                    disabled={isLoading || walletIsLoading}
                                    onClick={() => setAmountCents(amount)}
                                >
                                    {amount / 100} USD
                                </Button>
                            ))}
                        </div>

                        <Button className="bg-blue-400" variant="outline" disabled={isLoading || walletIsLoading} onClick={createPayment}>
                            {isLoading
                                ? "Creating payment..."
                                : `Pay ${amountCents / 100} USD`}
                        </Button>
                    </>
                )
            }

            {
                payment?.status === "pending" && (
                    <>
                        <p>
                            Amount:{" "}
                            <strong>{payment.amountCents / 100} USD</strong>
                        </p>

                        <Button className="bg-blue-400" variant="outline" disabled={isLoading || walletIsLoading} onClick={confirmPayment}>
                            {isLoading
                                ? "Confirming..."
                                : "Confirm test payment"}
                        </Button>
                    </>
                )
            }

            {
                payment?.status === "completed" && (
                    <>
                        <p role="status" className="text-green-600">
                            Payment completed. {payment.amountCents / 100} USD added
                            to your wallet.
                        </p>

                        <Button
                            className="bg-blue-400"
                            variant="outline"
                            onClick={() => {
                                setPayment(null)
                                setError("")
                            }}
                        >
                            New payment
                        </Button>
                    </>
                )
            }

            {
                error && (
                    <p role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                )
            }

            <Link href="/account/profile" className="underline">
                Back to profile
            </Link>
        </div >
    )
}
