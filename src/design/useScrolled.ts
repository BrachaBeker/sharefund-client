import { useEffect, useState } from "react"

export const useScrolled = (offset = 8) => {
    const [isScrolled, setIsScrolled] = useState(() => window.scrollY > offset)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > offset)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [offset])

    return isScrolled
}
