// ReactNode: תוכן נוסף, למשל כפתור או קישור
import type { ReactNode } from "react"
// הסמלים
import Icon, { type IconName } from "./Icon"

// מצב טעינה: עיגול מסתובב וטקסט. מופיע גם כשהשרת "ישן" והתשובה לוקחת זמן
export const LoadingState = ({ text = "טוען..." }: { text?: string }) => (
    // ממורכז, עם ריווח גדול למעלה ולמטה
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500" role="status">
        {/* העיגול המסתובב: מסגרת אפורה עם צד אחד בטורקיז, ו-animate-spin מסובב אותו */}
        <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
        {/* הטקסט */}
        <p className="text-sm font-medium">{text}</p>
        {/* הסבר קטן: השרת החינמי מתעורר אחרי הפסקה */}
        <p className="text-xs text-slate-400">בפעם הראשונה אחרי הפסקה זה יכול לקחת עד דקה</p>
    </div>
)

// מה מצב ריק או מצב שגיאה מקבל
interface StateProps {
    // הכותרת
    title: string,
    // שורת הסבר (לא חובה)
    text?: ReactNode,
    // כפתור או קישור (לא חובה)
    action?: ReactNode,
    // הסמל. ברירת המחדל נקבעת בכל מצב
    icon?: IconName
}

// מצב ריק: "עוד אין תנועות", "עוד אין הודעות"
export const EmptyState = ({ title, text, action, icon = "info" }: StateProps) => (
    // ממורכז, עם מסגרת מקווקוות
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
        {/* הסמל בתוך עיגול אפור */}
        <span className="mb-1 grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            {/* הסמל עצמו */}
            <Icon name={icon} className="size-6" />
        </span>
        {/* הכותרת */}
        <p className="font-semibold text-slate-700">{title}</p>
        {/* ההסבר */}
        {text && <p className="max-w-sm text-sm text-slate-500">{text}</p>}
        {/* הכפתור */}
        {action && <div className="mt-2">{action}</div>}
    </div>
)

// מצב שגיאה: הטעינה מהשרת נכשלה
export const ErrorState = ({ title, text, action, icon = "warning" }: StateProps) => (
    // ממורכז, ברקע אדום עדין
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        {/* הסמל בתוך עיגול אדום */}
        <span className="mb-1 grid size-12 place-items-center rounded-full bg-rose-100 text-rose-600">
            {/* הסמל עצמו */}
            <Icon name={icon} className="size-6" />
        </span>
        {/* הכותרת */}
        <p className="font-semibold text-rose-800">{title}</p>
        {/* ההסבר */}
        {text && <p className="max-w-sm text-sm text-rose-700">{text}</p>}
        {/* הכפתור */}
        {action && <div className="mt-2">{action}</div>}
    </div>
)
