import { useQuery } from "@tanstack/react-query"
import { getMessages } from "../services/api"
import { queryKeys } from "../services/queryKeys"

// מספר ההודעות שלא נקראו בקבוצה. מתרענן כל דקה (ה-Header והאזור האישי משתמשים באותה שאילתה)
export const useUnreadCount = (groupId: number, enabled = true) => {
    const { data } = useQuery({
        queryKey: queryKeys.messages(groupId, { box: "all" }),
        queryFn: () => getMessages({ groupId, filters: { box: "all" } }),
        enabled,
        refetchInterval: 60_000,
    })
    return data?.unreadCount ?? 0
}
