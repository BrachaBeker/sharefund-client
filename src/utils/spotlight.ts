import type { PointerEvent } from "react"

// שומר את מיקום העכבר בתוך הכרטיס, כדי שההילה של .spotlight תעקוב אחריו
export const trackPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`)
}
