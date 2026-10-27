// ReactNode: כפתורים או תוכן נוסף בצד הכותרת
import type { ReactNode } from "react"

// מה הקומפוננטה מקבלת
interface PageHeaderProps {
    // הכותרת הראשית של העמוד
    title: string,
    // שורת הסבר קצרה מתחת לכותרת (לא חובה)
    subtitle?: ReactNode,
    // כפתורים בצד השני של הכותרת (לא חובה)
    actions?: ReactNode
}

// כותרת אחידה לכל העמודים: כותרת, הסבר, וכפתורים בצד
const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
    // בטלפון אחד מתחת לשני, ובמסך רחב זה לצד זה
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {/* הכותרת וההסבר */}
        <div>
            {/* הכותרת: גדולה ומודגשת */}
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            {/* ההסבר: רק אם הועבר */}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {/* הכפתורים: רק אם הועברו */}
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
)

// מייצאים את הקומפוננטה
export default PageHeader
