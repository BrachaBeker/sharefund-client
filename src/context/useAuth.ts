import { createContext, useContext } from "react"
import type { LoginInput, User } from "../types"

// מה ה-Context מספק לכל הקומפוננטות
export interface AuthContextType {
    user: User | null
    setUser: (user: User) => void
    isLoading: boolean
    login: (input: LoginInput) => Promise<User>
    loginWithToken: (token: string) => Promise<User>
    logout: () => void
}

// ה-Context עצמו. הערך ההתחלתי null, והוא מתמלא ב-AuthProvider (בקובץ AuthContext.tsx).
// הוא בקובץ נפרד מה-Provider, כי קובץ של קומפוננטה צריך לייצא רק קומפוננטות (אחרת הרענון המהיר של Vite לא עובד)
export const AuthContext = createContext<AuthContextType | null>(null)

// hook לשימוש ב-Context: useAuth() במקום useContext(AuthContext) בכל קומפוננטה
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used inside AuthProvider")
    return context
}
