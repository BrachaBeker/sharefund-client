import { useEffect, useState } from "react"

// מחזיר את הערך רק אחרי שהמשתמש הפסיק להקליד לזמן קצר.
// כך שדה חיפוש לא שולח בקשה לשרת על כל אות, אלא פעם אחת אחרי שסיימו להקליד.
export const useDebouncedValue = <T,>(value: T, delay = 400) => {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}
