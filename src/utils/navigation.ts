// הקריאה לשרת שמביאה את "הקבוצות שלי"
import { getMyGroups } from "../services/api";
// הטיפוס של המשתמש
import type { User } from "../types";

// לאן עוברים אחרי כניסה או אחרי שינוי סיסמה
export const getPathAfterLogin = async (user: User) => {
    // סיסמה זמנית: קודם חייבים להחליף אותה
    if (user.mustChangePassword) return "/change-password"
    // מביאים את הקבוצות של המשתמש
    const groups = await getMyGroups()
    // קבוצה אחת בלבד: ישר לאזור האישי שלה
    if (groups.length === 1) return `/group/${groups[0].id}/dashboard`
    // אחרת (אפס או יותר מאחת): עמוד בחירת קבוצה
    return "/select-group"
}
