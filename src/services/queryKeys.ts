// הטיפוס של המטמון של React Query
import type { QueryClient } from "@tanstack/react-query";
// הטיפוסים של הסינונים שנכנסים למפתח
import type { MembersFilters, MessagesFilters, TransactionsFilters } from "../types";

// כל המפתחות של React Query במקום אחד.
// כך כל העמודים משתמשים בדיוק באותו מפתח, ו-invalidateQueries מרענן את כולם יחד.
// מפתח קצר (למשל members(1)) מרענן גם את כל המפתחות הארוכים שמתחילים בו (members(1, filters)).
export const queryKeys = {
    // רשימת "הקבוצות שלי"
    myGroups: ["myGroups"] as const,
    // פרטי קבוצה אחת (האזור האישי, ה-Header וכל עמודי הקבוצה)
    group: (groupId: number) => ["group", groupId] as const,
    // רשימת החברים. בלי filters – המפתח הכללי, שמרענן את כל הגרסאות המסוננות
    members: (groupId: number, filters?: MembersFilters) =>
        // אם יש סינון – הוא חלק מהמפתח, וכל סינון אחר שולח בקשה חדשה
        filters ? ["members", groupId, filters] as const : ["members", groupId] as const,
    // היסטוריית התנועות, לפי סינון ועמוד
    transactions: (groupId: number, filters?: TransactionsFilters) =>
        // כמו members: המפתח הכללי מרענן את כל הגרסאות
        filters ? ["transactions", groupId, filters] as const : ["transactions", groupId] as const,
    // ההודעות, לפי תיבה
    messages: (groupId: number, filters?: MessagesFilters) =>
        // כמו members: המפתח הכללי מרענן גם את התג ב-Header
        filters ? ["messages", groupId, filters] as const : ["messages", groupId] as const,
};

// אחרי פעולה כספית (הפקדה, משיכה, רישום מרוכז) היתרות השתנו בכמה מקומות.
// פונקציה אחת שמרעננת את כולם, כדי שכל טופס לא יכתוב את אותה רשימה מחדש
export const refreshAfterMoneyChange = (queryClient: QueryClient, groupId: number) => {
    // הקופה והיתרה שלי באזור האישי
    queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    // ההיסטוריה
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions(groupId) });
    // היתרות בטבלת החברים
    queryClient.invalidateQueries({ queryKey: queryKeys.members(groupId) });
    // היתרה שלי בעמוד בחירת הקבוצה
    queryClient.invalidateQueries({ queryKey: queryKeys.myGroups });
};
