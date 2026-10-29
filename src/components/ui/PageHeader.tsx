import type { ReactNode } from "react"

interface PageHeaderProps {
    title: string,
    eyebrow?: string,
    subtitle?: ReactNode,
    actions?: ReactNode
}

const PageHeader = ({ title, eyebrow, subtitle, actions }: PageHeaderProps) => (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
            {eyebrow && <p className="mb-1 text-sm text-slate-500">{eyebrow}</p>}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
)

export default PageHeader
