// ReactNode: כל דבר שאפשר להציג (טקסט, קישור, רשימה)
import type { ReactNode } from "react"
// הסמלים
import Icon, { type IconName } from "./Icon"

// ארבעה סוגי הודעות
type AlertVariant = "error" | "success" | "info" | "warning"

// הצבעים והסמל של כל סוג, במקום אחד
const styles: Record<AlertVariant, { box: string, icon: IconName }> = {
    // שגיאה: אדום
    error: { box: "border-rose-200 bg-rose-50 text-rose-800", icon: "warning" },
    // הצלחה: ירוק
    success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: "check" },
    // מידע: כחול
    info: { box: "border-sky-200 bg-sky-50 text-sky-800", icon: "info" },
    // אזהרה: צהוב
    warning: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: "warning" },
}

// מה הקומפוננטה מקבלת
interface AlertProps {
    // סוג ההודעה. ברירת המחדל: שגיאה
    variant?: AlertVariant,
    // התוכן של ההודעה
    children: ReactNode,
    // מחלקות נוספות מבחוץ (למשל רווח מעל)
    className?: string
}

// הודעה צבעונית עם סמל: שגיאה מהשרת, הצלחה, מידע או אזהרה
const Alert = ({ variant = "error", children, className = "" }: AlertProps) => (
    // role="alert": קוראי מסך מקריאים את ההודעה מיד כשהיא מופיעה
    <div role="alert" className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${styles[variant].box} ${className}`}>
        {/* הסמל של סוג ההודעה. shrink-0: לא מתכווץ כשהטקסט ארוך */}
        <Icon name={styles[variant].icon} className="mt-0.5 size-4 shrink-0" />
        {/* הטקסט */}
        <div>{children}</div>
    </div>
)

// מייצאים את הקומפוננטה
export default Alert
