"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type ScoreLocation =
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"

interface ImageData {
    secureUrl: string
    width: number
    height: number
}

export interface PostCardData {
    id: string
    content: string | null
    direction: "horizontal" | "vertical"
    author: {
        username: string
    }
    mergedImage: ImageData
    images: (ImageData & {
        id: string
        position: number
        scoreColor: string
        scoreLocation: ScoreLocation
        averageScore: number | null
        userScore: number | null
    })[]
}

interface PostCardProps {
    post: PostCardData
    canRate: boolean
}

const scoreLocations: Record<ScoreLocation, string> = {
    topLeft: "left-2 top-2",
    topRight: "right-2 top-2",
    bottomLeft: "bottom-2 left-2",
    bottomRight: "bottom-2 right-2",
}

const scoreOptions = [1, 2, 3, 4, 5, 6, 7, 8]

export default function PostCard({ post, canRate }: PostCardProps) {
    const router = useRouter()
    const carouselRef = useRef<HTMLDivElement>(null)

    const [activeSlide, setActiveSlide] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [selectedScores, setSelectedScores] = useState<
        Record<string, number>
    >(() => {
        const scores: Record<string, number> = {}

        post.images.forEach(image => {
            if (image.userScore !== null) {
                scores[image.id] = image.userScore
            }
        })

        return scores
    })

    const slideCount = post.images.length + 1

    const allScoresSelected =
        post.images.length > 0 &&
        post.images.every(image => selectedScores[image.id] !== undefined)

    const goToSlide = (index: number) => {
        const carousel = carouselRef.current

        if (!carousel || index < 0 || index >= slideCount) return

        carousel.scrollTo({
            left: index * carousel.clientWidth,
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth",
        })
    }

    const submitRatings = async () => {
        if (isSubmitting) return

        if (!canRate) {
            toast.error("Sign in to rate photos.")
            return
        }

        if (!allScoresSelected) {
            toast.error("Select a score for every photo.")
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch("/api/post/rate-post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId: post.id,
                    ratings: post.images.map(image => ({
                        imageId: image.id,
                        score: selectedScores[image.id],
                    })),
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => null)

                throw new Error(
                    typeof data?.error === "string"
                        ? data.error
                        : "Failed to submit ratings."
                )
            }

            toast.success("Ratings submitted.")
            router.refresh()
        } catch (error) {
            toast.error("Failed to submit ratings.", {
                description: error instanceof Error
                    ? error.message
                    : String(error),
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <article className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border bg-background">
            <header className="border-b px-4 py-3 font-semibold">
                @{post.author.username}
            </header>

            <div
                ref={carouselRef}
                role="region"
                aria-label="Post photos"
                aria-roledescription="carousel"
                tabIndex={0}
                onScroll={event => {
                    const carousel = event.currentTarget

                    if (carousel.clientWidth === 0) return

                    setActiveSlide(
                        Math.max(
                            0,
                            Math.min(
                                slideCount - 1,
                                Math.round(
                                    carousel.scrollLeft / carousel.clientWidth
                                )
                            )
                        )
                    )
                }}
                className="flex snap-x snap-mandatory overflow-x-auto"
            >

                {/* merged image alanı, her section bütün scroll alanını kaplıyor -> merged img, rating ve submit rating */}
                <section
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Overview, 1 of ${slideCount}`}
                    className="w-full min-w-0 shrink-0 snap-center snap-always"
                >
                    <div className="relative">
                        {/* merged img*/}
                        <img
                            src={post.mergedImage.secureUrl}
                            alt="Combined photos"
                            width={post.mergedImage.width}
                            height={post.mergedImage.height}
                            draggable={false}
                            className="block h-auto w-full"
                        />
                        {/* score alanı */}
                        <div
                            className={`pointer-events-none absolute inset-0 flex ${post.direction === "horizontal"
                                ? "flex-col"
                                : "flex-row"
                                }`}
                        >
                            {post.images.map(image => (
                                <div
                                    key={image.id}
                                    className="relative min-h-0 min-w-0 flex-1"
                                >
                                    <p
                                        className={`absolute m-0 text-xl font-bold ${scoreLocations[image.scoreLocation]
                                            }`}
                                        style={{
                                            color: image.scoreColor,
                                            textShadow:
                                                "0 1px 4px rgba(0,0,0,0.7)",
                                        }}
                                    >
                                        {image.averageScore === null
                                            ? "—"
                                            : image.averageScore.toFixed(1)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* verdiğin score ve submit rating alanı */}
                    <div className="space-y-3 p-4">
                        <div className="flex flex-wrap gap-4 text-sm">
                            {post.images.map((image, index) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => goToSlide(index + 1)}
                                    aria-label={`Rate photo ${index + 1}`}
                                    className="cursor-pointer rounded px-2 py-1 hover:bg-muted"
                                >
                                    {index + 1}:{" "}
                                    <strong>
                                        {selectedScores[image.id] ?? "—"}
                                    </strong>
                                </button>
                            ))}
                        </div>

                        <Button
                            type="button"
                            onClick={submitRatings}
                            disabled={
                                !canRate ||
                                !allScoresSelected ||
                                isSubmitting
                            }
                            className="w-full"
                        >
                            {isSubmitting ? "Submitting..." : "Submit ratings"}
                        </Button>

                        {!canRate && (
                            <p className="text-sm text-muted-foreground">
                                Sign in to rate photos.
                            </p>
                        )}
                    </div>
                </section>
                {/* ayrı olan fotoların alanı */}
                {post.images.map((image, index) => (
                    <section
                        key={image.id}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`Photo ${index + 1}, ${index + 2} of ${slideCount}`}
                        className="w-full min-w-0 shrink-0 snap-center snap-always"
                    >
                        <div
                            className="flex items-center justify-center bg-black"
                            style={{
                                aspectRatio:
                                    post.mergedImage.width /
                                    post.mergedImage.height,
                            }}
                        >
                            <img
                                src={image.secureUrl}
                                alt={`Photo ${index + 1}`}
                                width={image.width}
                                height={image.height}
                                draggable={false}
                                loading="lazy"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <fieldset
                            disabled={!canRate || isSubmitting}
                            className="p-4"
                        >
                            <legend className="px-1 text-sm font-medium">
                                Rate photo {index + 1}
                            </legend>

                            <div className="grid grid-cols-8 gap-1">
                                {scoreOptions.map(score => (
                                    <label
                                        key={score}
                                        className="relative cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name={`rating-${post.id}-${image.id}`}
                                            value={score}
                                            checked={
                                                selectedScores[image.id] === score
                                            }
                                            onChange={() =>
                                                setSelectedScores(prev => ({
                                                    ...prev,
                                                    [image.id]: score,
                                                }))
                                            }
                                            className="peer sr-only left-0 top-0"
                                        />

                                        <span
                                            className="flex h-10 items-center justify-center rounded-md border text-sm transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-50"
                                        >
                                            {score}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </section>
                ))}
            </div>

            <nav
                aria-label="Photo navigation"
                className="flex items-center justify-between border-t px-4 py-2"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Previous slide"
                    onClick={() => goToSlide(activeSlide - 1)}
                    disabled={activeSlide === 0}
                >
                    <ChevronLeft />
                </Button>

                <span
                    aria-live="polite"
                    className="text-sm text-muted-foreground"
                >
                    {activeSlide + 1} / {slideCount}
                </span>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Next slide"
                    onClick={() => goToSlide(activeSlide + 1)}
                    disabled={activeSlide === slideCount - 1}
                >
                    <ChevronRight />
                </Button>
            </nav>

            {post.content && (
                <p className="whitespace-pre-wrap break-words border-t p-4 text-sm">
                    {post.content}
                </p>
            )}
        </article>
    )
}