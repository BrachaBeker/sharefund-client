// ReactNode: מה שמופיע בתוך הריבוע (₪ או אות)
import type { ReactNode } from "react"

// מה הקומפוננטה מקבלת
interface LogoMarkProps {
    // התוכן: סימן השקל בלוגו, או האות הראשונה של שם קבוצה
    children: ReactNode,
    // הגודל והגופן (למשל "size-9 rounded-xl text-lg")
    className: string
}

// ריבוע מעוגל עם מעבר צבע טורקיז-ירוק. משמש בלוגו, בעמודי הכניסה ובכרטיסי הקבוצות
const LogoMark = ({ children, className }: LogoMarkProps) => (
    // מעבר צבע, טקסט לבן מודגש וצל צבעוני
    <span className={`grid shrink-0 place-items-center bg-gradient-to-br from-teal-500 to-emerald-600 font-black text-white shadow-md shadow-teal-600/30 ${className}`}>
        {/* התוכן */}
        {children}
    </span>
)

// מייצאים את הקומפוננטה
export default LogoMark
