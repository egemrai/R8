"use client"

import Link from "next/link"

interface ButtonProps {

    name: string
}

const Button = ({ name }: ButtonProps) => {



    return (
        <Link href={`/profile/${name}/?name=egem`}>
            <button className='bg-red-500 w-20 h-20 flex' >
                {name}
            </button>
        </Link>
    )
}

export default Button