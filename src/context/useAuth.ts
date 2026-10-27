// createContext: יצירת ה-Context. useContext: קריאה ממנו
import { createContext, useContext } from "react";
// הטיפוסים של פרטי הכניסה ושל המשתמש
import type { LoginInput, User } from "../types";

// מה ה-Context מספק לכל הקומפוננטות
export interface AuthContextType {
    // המשתמש המחובר, או null כשאין משתמש מחובר
    user: User | null;
    // עדכון המשתמש (אחרי שינוי שם או סיסמה)
    setUser: (user: User) => void;
    // true בזמן שבודקים בטעינת האתר אם הטוקן השמור עדיין תקף
    isLoading: boolean;
    // כניסה עם מייל וסיסמה
    login: (input: LoginInput) => Promise<User>;
    // כניסה עם טוקן שכבר התקבל (אורח שיצר קבוצה)
    loginWithToken: (token: string) => Promise<User>;
    // התנתקות
    logout: () => void;
}

// ה-Context עצמו. הערך ההתחלתי null, והוא מתמלא ב-AuthProvider (בקובץ AuthContext.tsx).
// הוא בקובץ נפרד מה-Provider, כי קובץ של קומפוננטה צריך לייצא רק קומפוננטות (אחרת הרענון המהיר של Vite לא עובד)
export const AuthContext = createContext<AuthContextType | null>(null);

// hook לשימוש ב-Context: useAuth() במקום useContext(AuthContext) בכל קומפוננטה
export const useAuth = () => {
    // קוראים את הערך
    const context = useContext(AuthContext);
    // אם אין ערך – הקומפוננטה לא נמצאת בתוך AuthProvider, וזו שגיאה בקוד
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    // מחזירים את הערך
    return context;
};
