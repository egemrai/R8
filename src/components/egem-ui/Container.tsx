

export function Container({
    children, className
}: {
    children: React.ReactNode, className?: any
}) {
    return (
        <div className={`mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-8 ${className}`}>
            {children}
        </div>
    )
}