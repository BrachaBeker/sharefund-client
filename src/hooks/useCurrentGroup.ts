import { useOutletContext } from "react-router-dom"
import type { GroupDashboard } from "../types"

// מה GroupLayout מעביר לכל עמוד של קבוצה
export interface CurrentGroup {
    groupId: number,
    group: GroupDashboard
}

// כל עמוד של קבוצה (אזור אישי, חברים, היסטוריה, הודעות) קורא לזה במקום לטעון את הקבוצה בעצמו
export const useCurrentGroup = () => useOutletContext<CurrentGroup>()
