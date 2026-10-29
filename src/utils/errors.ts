import axios from "axios"
import type { ApiError } from "../types"

export const getApiError = (err: unknown) =>
    axios.isAxiosError<ApiError>(err) ? err.response?.data?.error : undefined

export const getErrorMessage = (err: unknown) => {
    const apiError = getApiError(err)
    if (apiError?.message) return apiError.message
    if (axios.isAxiosError(err) && !err.response) return "אין חיבור לשרת. נסו שוב בעוד רגע"
    return "אירעה שגיאה לא צפויה"
}
