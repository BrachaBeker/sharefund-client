import type { ReactNode } from "react"
// עיצוב – לא לוגיקה
import Icon, { type IconName } from "../../design/Icon"

export const LoadingState = ({ text = "טוען..." }: { text?: string }) => (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500" role="status">
        <span className="size-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600" />
        <p className="text-sm font-medium">{text}</p>
        <p className="text-xs text-slate-400">בפעם הראשונה אחרי הפסקה זה יכול לקחת עד דקה</p>
    </div>
)

interface StateProps {
    title: string,
    text?: ReactNode,
    action?: ReactNode,
    icon?: IconName
}

export const EmptyState = ({ title, text, action, icon = "info" }: StateProps) => (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <span className="mb-1 grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Icon name={icon} />
        </span>
        <p className="font-semibold text-slate-700">{title}</p>
        {text && <p className="max-w-sm text-sm text-slate-500">{text}</p>}
        {action && <div className="mt-2">{action}</div>}
    </div>
)

export const ErrorState = ({ title, text, action, icon = "warning" }: StateProps) => (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <span className="mb-1 grid size-11 place-items-center rounded-full bg-rose-100 text-rose-600">
            <Icon name={icon} />
        </span>
        <p className="font-semibold text-rose-800">{title}</p>
        {text && <p className="max-w-sm text-sm text-rose-700">{text}</p>}
        {action && <div className="mt-2">{action}</div>}
    </div>
)
