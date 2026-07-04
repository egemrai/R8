import Image from "next/image"

interface UserPageProps {
    params: any //Promise<{ role: string }>
    searchParams: any //Promise<{ [key: string]: string | string[] | undefined | any }>
    propTest: string
}

export default async function UserPage({ params, searchParams, propTest }: UserPageProps) {

    const role = (await params).role
    const name = (await searchParams).name

    // const name = searchParams.name

    console.log('role:', role)
    console.log('searchParams:', await searchParams)
    console.log('name:', name)

    return (
        <>

            <div className=" text-black p-4">
                {role.toString()} hg
            </div>
            <div className=" text-black p-4">
                {name.toString()} name
            </div>
        </>
    )
}

// tailwind.config.ts