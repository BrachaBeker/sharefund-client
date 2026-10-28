import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getMembers } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { MembersFilters } from "../types"

// רשימת החברים של קבוצה. משמשת את עמוד החברים, את סינון ההיסטוריה, את בחירת הנמענים ואת הרישום המרוכז.
// כולם משתמשים באותו מפתח, ולכן בקשה אחת מספיקה לכולם, והרענון אחרי שינוי מעדכן את כולם.
export const useMembers = (groupId: number, filters: MembersFilters = {}, enabled = true) =>
    useQuery({
        queryKey: queryKeys.members(groupId, filters),
        queryFn: () => getMembers({ groupId, filters }),
        enabled,
        placeholderData: keepPreviousData,
    })
