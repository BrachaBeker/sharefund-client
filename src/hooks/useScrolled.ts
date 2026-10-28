import { useEffect, useState } from "react"

// true אחרי שגוללים מעט למטה. ה-Header משתמש בזה כדי להוסיף צל
export const useScrolled = (offset = 8) => {
    const [isScrolled, setIsScrolled] = useState(() => window.scrollY > offset)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > offset)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [offset])

    return isScrolled
}
