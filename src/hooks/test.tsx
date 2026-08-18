import { useState, useCallback } from "react"
import { useInfiniteScroll } from "./useInfiniteScroll"

function Products() {
    const [products, setProducts] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const loadMore = useCallback(async () => {
        setLoading(true)

        try {
            const response = await fetch(
                `/api/products?page=${page}`
            )

            const data = await response.json()

            setProducts(prev => [
                ...prev,
                ...data.items,
            ])

            setHasMore(data.hasMore)

            setPage(prev => prev + 1)
        } finally {
            setLoading(false)
        }
    }, [page])

    const loaderRef = useInfiniteScroll({
        loading,
        hasMore,
        onLoadMore: loadMore,
    })

    return (
        <>
            {products.map(product => (
                <div key={product.id}>
                    {product.name}
                </div>
            ))}

            <div ref={loaderRef}>
                {loading && "Loading..."}
            </div>
        </>
    )
}