

export function Container({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="border-2 mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-8">
            {children}
        </div>
    )
}