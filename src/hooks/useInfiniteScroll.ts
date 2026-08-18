"use client"

import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
    loading: boolean
    hasMore: boolean
    onLoadMore: () => void
}

export function useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore,
}: UseInfiniteScrollProps) {
    const loaderRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const loader = loaderRef.current

        if (!loader) return
        if (!hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]

                if (entry.isIntersecting && !loading) {
                    console.log('observer çalıştı')
                    onLoadMore()
                }
            },
            {
                rootMargin: "200px",
            }
        );

        observer.observe(loader)

        return () => {
            observer.disconnect()
        };
    }, [loading, hasMore, onLoadMore])

    return loaderRef
}