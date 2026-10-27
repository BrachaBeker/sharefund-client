// useEffect: פעולה בטעינה. useState: שמירת מצב. ReactNode: הילדים שנעטפים
import { useEffect, useState, type ReactNode } from "react";
// גישה למטמון של React Query, כדי לנקות אותו בהתנתקות
import { useQueryClient } from "@tanstack/react-query";
// הטיפוסים של פרטי הכניסה ושל המשתמש
import type { LoginInput, User } from "../types";
// הקריאות לשרת וניהול הטוקן
import { getMe, getToken, login as loginRequest, removeToken, setToken } from "../services/api";
// ה-Context והטיפוס שלו (מוגדרים ב-useAuth.ts)
import { AuthContext, type AuthContextType } from "./useAuth";

// הקומפוננטה שעוטפת את כל האפליקציה ומחזיקה את המשתמש המחובר
const AuthProvider = ({ children }: { children: ReactNode }) => {
    // המשתמש המחובר
    const [user, setUser] = useState<User | null>(null);
    // מתחילים במצב "טוען", עד שהבדיקה של הטוקן מסתיימת
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // המטמון של React Query
    const queryClient = useQueryClient();

    // פעם אחת בטעינת האתר: אם יש טוקן שמור, משחזרים את המשתמש מהשרת
    useEffect(() => {
        // פונקציה פנימית, כי useEffect לא יכול לקבל פונקציה async ישירות
        const initializeAuth = async () => {
            // יש טוקן שמור מהביקור הקודם
            if (getToken()) {
                // try: אם הטוקן פג תוקף, השרת מחזיר שגיאה
                try {
                    // מביאים את המשתמש לפי הטוקן
                    const savedUser = await getMe();
                    // שומרים אותו: המשתמש נשאר מחובר אחרי רענון
                    setUser(savedUser);
                } catch {
                    // הטוקן לא תקף: אין משתמש מחובר
                    setUser(null);
                }
            }
            // הבדיקה הסתיימה: אפשר להציג את העמודים
            setIsLoading(false);
        };
        // מפעילים את הבדיקה
        initializeAuth();
        // מערך ריק: רק פעם אחת, בטעינה
    }, []);

    // כניסה: שולחים מייל וסיסמה, ושומרים את הטוקן ואת המשתמש
    const login = async (input: LoginInput) => {
        // הבקשה לשרת
        const data = await loginRequest(input);
        // שומרים את הטוקן ב-localStorage
        setToken(data.token);
        // שומרים את המשתמש ב-Context
        setUser(data.user);
        // מחזירים את המשתמש, כדי שעמוד הכניסה ידע לאן לעבור
        return data.user;
    };

    // כניסה עם טוקן מוכן: שומרים אותו ומביאים את המשתמש מהשרת
    const loginWithToken = async (token: string) => {
        // שומרים את הטוקן, כדי שהבקשה הבאה תישלח איתו
        setToken(token);
        // מביאים את המשתמש שהטוקן שייך לו
        const me = await getMe();
        // שומרים אותו ב-Context
        setUser(me);
        // מחזירים אותו למי שקרא לפונקציה
        return me;
    };

    // התנתקות: מוחקים את הטוקן, את המשתמש ואת כל הנתונים שנשמרו במטמון
    const logout = () => {
        // מחיקת הטוקן
        removeToken();
        // אין משתמש מחובר
        setUser(null);
        // מנקים את המטמון, כדי שמשתמש אחר לא יראה נתונים של הקודם
        queryClient.clear();
    };

    // הערך שכל הקומפוננטות יקבלו
    const value: AuthContextType = { user, setUser, isLoading, login, loginWithToken, logout };
    // עוטפים את כל הילדים ב-Provider עם הערך
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// מייצאים רק את ה-Provider (ה-hook useAuth נמצא ב-useAuth.ts)
export { AuthProvider };
