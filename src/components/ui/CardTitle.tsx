import type { ReactNode } from "react"

interface CardTitleProps {
    title: string,
    subtitle?: ReactNode,
    actions?: ReactNode
}

const CardTitle = ({ title, subtitle, actions }: CardTitleProps) => (
    <div className="mb-5 flex items-start justify-between gap-3">
        <div>
            <h2 className="card-title">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions}
    </div>
)

export default CardTitle
