import type { CSSProperties } from "react"
import Icon from "./Icon"
import Avatar from "./Avatar"
import { gradientFor } from "./colors"

interface GroupPreviewProps {
    groupName: string,
    managerName: string,
    memberNames: string[]
}

const tips = ["כל חבר מקבל סיסמה זמנית", "בכניסה הראשונה מחליפים אותה", "הקופה מתחילה מ-0 ₪"]

const GroupPreview = ({ groupName, managerName, memberNames }: GroupPreviewProps) => {
    const name = groupName.trim() || "שם הקבוצה"
    const manager = managerName.trim() || "המנהל/ת"
    const members = memberNames.map((memberName, index) => memberName.trim() || `חבר ${index + 1}`)

    return (
        <aside className="relative isolate overflow-hidden rounded-[2.5rem] bg-linear-to-bl from-brand-500 via-brand-600 to-indigo-900 p-7 text-white shadow-2xl shadow-brand-700/30" aria-hidden="true">
            <span className="blob-drift absolute -top-20 -left-16 -z-10 size-64 rounded-full bg-fuchsia-400/30 blur-2xl" />
            <span className="blob-drift absolute -right-10 -bottom-24 -z-10 size-72 rounded-full bg-accent-400/30 blur-2xl [animation-delay:-5s]" />

            <p className="text-sm font-medium text-white/70">תצוגה מקדימה</p>
            <h2 className="mt-1 text-2xl leading-tight font-extrabold text-white">כך תיראה הקבוצה שלכם</h2>

            <div className="mt-6 -rotate-1 rounded-3xl bg-white p-5 text-ink shadow-2xl">
                <div className="flex items-center gap-3">
                    <Avatar name={name} className={`breathe size-12 rounded-2xl bg-linear-to-br text-lg text-white shadow-lg ${gradientFor(name)}`} />
                    <div className="min-w-0 flex-1">
                        <p className={`truncate text-lg font-bold ${groupName.trim() ? "" : "text-slate-300"}`}>{name}</p>
                        <p className="text-xs text-slate-500">{members.length + 1} חברים · יתרה 0.00 ₪</p>
                    </div>
                    <span className="badge bg-emerald-50 text-emerald-700">פעילה</span>
                </div>

                <ul className="mt-4 max-h-64 space-y-1.5 overflow-y-auto border-t border-slate-100 pt-4">
                    <li className="flex items-center gap-2.5">
                        <Avatar name={manager} className="size-8 bg-linear-to-br from-brand-500 to-indigo-600 text-xs text-white" />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{manager}</span>
                        <span className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-200 ring-inset">מנהל</span>
                    </li>
                    {members.map((memberName, index) => (
                        <li key={index} className="pop-in flex items-center gap-2.5">
                            <Avatar name={memberName} className={`size-8 bg-linear-to-br text-xs text-white ${gradientFor(memberName)}`} />
                            <span className={`min-w-0 flex-1 truncate text-sm ${memberNames[index].trim() ? "font-medium" : "text-slate-400"}`}>{memberName}</span>
                            <span className="badge bg-slate-100 text-slate-600">חבר</span>
                        </li>
                    ))}
                </ul>
            </div>

            <ul className="mt-6 space-y-2.5">
                {tips.map((tip, index) => (
                    <li key={tip} className="flex items-center gap-2.5 text-sm text-white/85">
                        <span className="grid size-6 place-items-center rounded-full bg-white/15" style={{ "--delay": `${600 + index * 450}ms` } as CSSProperties}><Icon name="check" className="draw-check size-3.5" /></span>
                        {tip}
                    </li>
                ))}
            </ul>

            <span className="float absolute top-6 left-6 grid size-11 place-items-center rounded-full bg-amber-300 font-bold text-amber-800 shadow-lg ring-4 ring-amber-200/50">₪</span>
        </aside>
    )
}

export default GroupPreview
