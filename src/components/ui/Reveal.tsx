import { useEffect, useRef, useState, type ReactNode } from "react"

interface RevealProps {
    children: ReactNode,
    delay?: number,
    effect?: "rise" | "draw",
    className?: string
}

// מציג את התוכן כשהוא נכנס למסך בגלילה, פעם אחת בלבד: rise עולה בעדינות, draw נחשף מלמעלה למטה (לקווים). delay במילישניות, ליצירת הופעה מדורגת
const Reveal = ({ children, delay = 0, effect = "rise", className = "" }: RevealProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true)
                observer.disconnect()
            }
        }, { rootMargin: "0px 0px -8% 0px" })
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className={`${effect === "rise" ? "reveal" : "reveal-draw"} ${isVisible ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    )
}

export default Reveal
