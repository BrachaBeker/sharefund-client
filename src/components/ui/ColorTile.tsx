import { Link } from "react-router-dom"
import Icon, { type IconName } from "./Icon"

const tones = {
    blue: "bg-linear-to-br from-sky-400 to-blue-600 shadow-blue-500/25",
    orange: "bg-linear-to-br from-amber-400 to-accent-500 shadow-accent-500/25",
    green: "bg-linear-to-br from-emerald-400 to-teal-600 shadow-emerald-500/25",
    purple: "bg-linear-to-br from-fuchsia-400 to-purple-600 shadow-purple-500/25",
}

interface ColorTileProps {
    label: string,
    value: string,
    hint: string,
    icon: IconName,
    tone: keyof typeof tones,
    to?: string
}

// אריח צבעוני עם נתון אחד. עם to הוא גם קישור, ומתרומם במעבר עכבר
const ColorTile = ({ label, value, hint, icon, tone, to }: ColorTileProps) => {
    const content = (
        <>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/90">{label}</p>
                <Icon name={icon} className="size-5 text-white/80" />
            </div>
            <p className="mt-2 truncate text-xl font-bold tabular-nums sm:mt-3 sm:text-3xl">{value}</p>
            <p className="mt-1 truncate text-xs text-white/80">{hint}</p>
        </>
    )
    const className = `tile block h-full ${tones[tone]}`

    return to
        ? <Link to={to} className={`${className} transition duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1`}>{content}</Link>
        : <div className={className}>{content}</div>
}

export default ColorTile
