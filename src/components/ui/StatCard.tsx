import Icon, { type IconName } from "./Icon"

interface StatCardProps {
    label: string,
    value: string,
    icon: IconName,
    tone: string,
    valueClass?: string
}

// כרטיס נתון: סמל צבעוני, תווית וערך גדול (בראש עמוד ההיסטוריה)
const StatCard = ({ label, value, icon, tone, valueClass = "text-slate-900" }: StatCardProps) => (
    <div className="card flex items-center gap-4 p-4 sm:p-5">
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone}`}><Icon name={icon} className="size-5" /></span>
        <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`truncate text-xl font-bold tabular-nums ${valueClass}`}>{value}</p>
        </div>
    </div>
)

export default StatCard
