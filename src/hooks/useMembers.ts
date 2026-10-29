import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getMembers } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { MembersFilters } from "../types"

export const useMembers = (groupId: number, filters: MembersFilters = {}, enabled = true) =>
    useQuery({
        queryKey: queryKeys.members(groupId, filters),
        queryFn: () => getMembers({ groupId, filters }),
        enabled,
        placeholderData: keepPreviousData,
    })
