// הטיפוס של התפקיד
import type { Role } from "../../types"
// שמות התפקידים בעברית
import { roleNames } from "../../utils/labels"

// תג התפקיד: סגול למנהל, אפור לחבר. משמש ב-Header, בבחירת קבוצה וברשימת החברים
const RoleBadge = ({ role }: { role: Role }) => (
    // הצבע לפי התפקיד
    <span className={`badge ${role === "manager" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
        {/* השם בעברית */}
        {roleNames[role]}
    </span>
)

// מייצאים את הקומפוננטה
export default RoleBadge
