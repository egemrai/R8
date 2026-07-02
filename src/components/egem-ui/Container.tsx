

export function Container({
    children, className
}: {
    children: React.ReactNode, className?: any
}) {
    return (
        <div className={`mx-auto w-[70vw] min-w-[380px] px-6 md:px-8 lg:px-8 ${className}`}>
            {children}
        </div>
    )
}