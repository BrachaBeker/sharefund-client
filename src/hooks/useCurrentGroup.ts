// useOutletContext: קורא את הערך ש-GroupLayout מעביר לעמודים שבתוכו
import { useOutletContext } from "react-router-dom"
// הטיפוס של פרטי הקבוצה
import type { GroupDashboard } from "../types"

// מה GroupLayout מעביר לכל עמוד של קבוצה
export interface CurrentGroup {
    // מזהה הקבוצה מהכתובת, כבר כמספר ובדוק
    groupId: number,
    // פרטי הקבוצה מהשרת (תפקיד, יתרות, האם פעילה), כבר טעונים
    group: GroupDashboard
}

// כל עמוד של קבוצה (אזור אישי, חברים, היסטוריה, הודעות) קורא לזה במקום לטעון את הקבוצה בעצמו
export const useCurrentGroup = () => useOutletContext<CurrentGroup>()
