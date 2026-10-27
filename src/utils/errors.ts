// axios: כדי לבדוק אם השגיאה הגיעה מבקשה לשרת
import axios from "axios";
// הטיפוס של מבנה השגיאה שהשרת מחזיר
import type { ApiError } from "../types";

// השגיאה מהשרת במבנה { error: { code, message, details } }, או undefined אם זו לא שגיאה מהשרת
export const getApiError = (err: unknown) =>
    // isAxiosError בודק שזו שגיאה של axios, ואז קוראים את data.error מהתשובה (אם יש תשובה)
    axios.isAxiosError<ApiError>(err) ? err.response?.data?.error : undefined

// הודעה בעברית להצגה למשתמש: ההודעה מהשרת, או הודעה כללית
export const getErrorMessage = (err: unknown) => {
    // אם השגיאה מהשרת – מחזירים את ההודעה שלו כמו שהיא
    const apiError = getApiError(err)
    // יש הודעה מהשרת: מציגים אותה
    if (apiError?.message) return apiError.message
    // שגיאת axios בלי תשובה: השרת לא ענה (אין אינטרנט, או שהשרת עדיין מתעורר)
    if (axios.isAxiosError(err) && !err.response) return "אין חיבור לשרת. נסו שוב בעוד רגע"
    // כל מקרה אחר: הודעה כללית
    return "אירעה שגיאה לא צפויה"
}
