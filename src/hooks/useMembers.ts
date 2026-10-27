// useQuery: טעינה מהשרת. keepPreviousData: משאיר את הרשימה הקודמת בזמן שהסינון החדש נטען
import { keepPreviousData, useQuery } from "@tanstack/react-query"
// הקריאה לשרת
import { getMembers } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הטיפוס של הסינון
import type { MembersFilters } from "../types"

// רשימת החברים של קבוצה. משמשת את עמוד החברים, את סינון ההיסטוריה, את בחירת הנמענים ואת הרישום המרוכז.
// כולם משתמשים באותו מפתח, ולכן בקשה אחת מספיקה לכולם, והרענון אחרי שינוי מעדכן את כולם.
export const useMembers = (groupId: number, filters: MembersFilters = {}, enabled = true) =>
    // useQuery עם המפתח, הפונקציה והאפשרויות
    useQuery({
        // המפתח כולל את הסינון: סינון אחר = בקשה אחרת
        queryKey: queryKeys.members(groupId, filters),
        // הפונקציה ששולחת את הבקשה
        queryFn: () => getMembers({ groupId, filters }),
        // אפשר לכבות את הטעינה (למשל לחבר רגיל, שלא צריך את הרשימה המלאה)
        enabled,
        // בזמן הקלדה בחיפוש הטבלה לא נעלמת
        placeholderData: keepPreviousData,
    })
