// useState: שמירת הערך המעוכב. useEffect: הפעלת הטיימר
import { useEffect, useState } from "react"

// מחזיר את הערך רק אחרי שהמשתמש הפסיק להקליד לזמן קצר.
// כך שדה חיפוש לא שולח בקשה לשרת על כל אות, אלא פעם אחת אחרי שסיימו להקליד.
export const useDebouncedValue = <T,>(value: T, delay = 400) => {
    // הערך שמוחזר. מתחיל כמו הערך המקורי
    const [debounced, setDebounced] = useState(value)

    // בכל שינוי של הערך: מחכים delay מילישניות ורק אז מעדכנים
    useEffect(() => {
        // מתחילים טיימר
        const timer = setTimeout(() => setDebounced(value), delay)
        // אם הערך השתנה שוב לפני שהזמן עבר: מבטלים את הטיימר הקודם
        return () => clearTimeout(timer)
        // מפעילים מחדש בכל שינוי של הערך או של זמן ההמתנה
    }, [value, delay])

    // מחזירים את הערך המעוכב
    return debounced
}
