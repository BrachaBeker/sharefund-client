import { useOutletContext } from "react-router-dom"
import type { GroupDashboard } from "../types"

export interface CurrentGroup {
    groupId: number,
    group: GroupDashboard
}

export const useCurrentGroup = () => useOutletContext<CurrentGroup>()
