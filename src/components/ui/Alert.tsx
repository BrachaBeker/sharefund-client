import type { ReactNode } from "react"
import Icon, { type IconName } from "./Icon"

type AlertVariant = "error" | "success" | "info" | "warning"

const styles: Record<AlertVariant, { box: string, icon: IconName }> = {
    error: { box: "border-rose-200 bg-rose-50 text-rose-800", icon: "warning" },
    success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: "check" },
    info: { box: "border-sky-200 bg-sky-50 text-sky-800", icon: "info" },
    warning: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: "warning" },
}

interface AlertProps {
    variant?: AlertVariant,
    children: ReactNode,
    className?: string
}

// הודעה צבעונית עם סמל: שגיאה מהשרת, הצלחה, מידע או אזהרה
const Alert = ({ variant = "error", children, className = "" }: AlertProps) => (
    <div role="alert" className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${styles[variant].box} ${className}`}>
        <Icon name={styles[variant].icon} className="mt-0.5 size-4 shrink-0" />
        <div>{children}</div>
    </div>
)

export default Alert
