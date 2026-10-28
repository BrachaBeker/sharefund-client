import type { QueryClient } from "@tanstack/react-query"
import type { MembersFilters, MessagesFilters, TransactionsFilters } from "../types"

// כל המפתחות של React Query במקום אחד.
// כך כל העמודים משתמשים בדיוק באותו מפתח, ו-invalidateQueries מרענן את כולם יחד.
// מפתח קצר (למשל members(1)) מרענן גם את כל המפתחות הארוכים שמתחילים בו (members(1, filters)).
export const queryKeys = {
    myGroups: ["myGroups"] as const,
    group: (groupId: number) => ["group", groupId] as const,
    members: (groupId: number, filters?: MembersFilters) =>
        filters ? ["members", groupId, filters] as const : ["members", groupId] as const,
    transactions: (groupId: number, filters?: TransactionsFilters) =>
        filters ? ["transactions", groupId, filters] as const : ["transactions", groupId] as const,
    messages: (groupId: number, filters?: MessagesFilters) =>
        filters ? ["messages", groupId, filters] as const : ["messages", groupId] as const,
}

// אחרי פעולה כספית (הפקדה, משיכה, רישום מרוכז) היתרות השתנו בכמה מקומות.
// פונקציה אחת שמרעננת את כולם, כדי שכל טופס לא יכתוב את אותה רשימה מחדש
export const refreshAfterMoneyChange = (queryClient: QueryClient, groupId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions(groupId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.members(groupId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
}
