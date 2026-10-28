import axios from "axios"
import type { ApiError } from "../types"

// השגיאה מהשרת במבנה { error: { code, message, details } }, או undefined אם זו לא שגיאה מהשרת
export const getApiError = (err: unknown) =>
    axios.isAxiosError<ApiError>(err) ? err.response?.data?.error : undefined

// הודעה בעברית להצגה למשתמש: ההודעה מהשרת, או הודעה כללית
export const getErrorMessage = (err: unknown) => {
    const apiError = getApiError(err)
    if (apiError?.message) return apiError.message
    if (axios.isAxiosError(err) && !err.response) return "אין חיבור לשרת. נסו שוב בעוד רגע"
    return "אירעה שגיאה לא צפויה"
}
