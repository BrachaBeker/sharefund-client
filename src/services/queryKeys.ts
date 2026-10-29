import type { QueryClient } from "@tanstack/react-query"
import type { MembersFilters, MessagesFilters, TransactionsFilters } from "../types"

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

export const refreshAfterMoneyChange = (queryClient: QueryClient, groupId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions(groupId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.members(groupId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
}
