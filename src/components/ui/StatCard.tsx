// הסמלים
import Icon, { type IconName } from "./Icon"

// מה הקומפוננטה מקבלת
interface StatCardProps {
    // התווית הקטנה
    label: string,
    // הערך הגדול (כבר מעוצב כטקסט)
    value: string,
    // הסמל
    icon: IconName,
    // מחלקות הצבע של הסמל והרקע שלו
    tone: string,
    // מחלקת הצבע של הערך (למשל positive / negative). לא חובה
    valueClass?: string
}

// כרטיס נתון: סמל צבעוני, תווית וערך גדול (בראש עמוד ההיסטוריה)
const StatCard = ({ label, value, icon, tone, valueClass = "text-slate-900" }: StatCardProps) => (
    // הכרטיס: סמל מימין, טקסט משמאל
    <div className="card flex items-center gap-4 p-4 sm:p-5">
        {/* הסמל בריבוע מעוגל צבעוני */}
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon name={icon} className="size-6" /></span>
        {/* התווית והערך */}
        <div className="min-w-0">
            {/* התווית */}
            <p className="text-xs font-medium text-slate-500">{label}</p>
            {/* הערך */}
            <p className={`truncate text-xl font-extrabold tracking-tight ${valueClass}`}>{value}</p>
        </div>
    </div>
)

// מייצאים את הקומפוננטה
export default StatCard
