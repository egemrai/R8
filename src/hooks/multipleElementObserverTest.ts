"use client"

import { useEffect } from "react"

export default function MultipleElementObserverTest() {

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        console.log("Görünen element:", entry.target)
                    }
                })
            },
            {
                rootMargin: "200px",
            }
        )

        const elements = document.querySelectorAll(".observe")

        elements.forEach((element) => {
            observer.observe(element)
        })

        return () => {
            observer.disconnect()
        }
    }, [])
}

