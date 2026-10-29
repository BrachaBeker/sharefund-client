import type { Role } from "../../types"
import { roleNames } from "../../utils/labels"

const RoleBadge = ({ role }: { role: Role }) => (
    <span className={`badge ${role === "manager" ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200 ring-inset" : "bg-slate-100 text-slate-600"}`}>
        {roleNames[role]}
    </span>
)

export default RoleBadge
