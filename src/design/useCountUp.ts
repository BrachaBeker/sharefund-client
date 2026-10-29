import { useEffect, useRef, useState } from "react"

export const useCountUp = (target: number, duration = 1400) => {
    const [value, setValue] = useState(0)
    const shownRef = useRef(0)

    useEffect(() => {
        const from = shownRef.current
        const show = (next: number) => {
            shownRef.current = next
            setValue(next)
        }
        if (from === target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            show(target)
            return
        }
        const start = performance.now()
        let frame = 0
        const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - (1 - progress) ** 3
            show(progress === 1 ? target : from + (target - from) * eased)
            if (progress < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [target, duration])

    return value
}
