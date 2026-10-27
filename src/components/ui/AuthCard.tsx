// ReactNode: התוכן של הכרטיס (הטופס)
import type { ReactNode } from "react"
// הריבוע של הלוגו
import LogoMark from "./LogoMark"

// מה הקומפוננטה מקבלת
interface AuthCardProps {
    // הכותרת
    title: string,
    // שורת הסבר מתחת לכותרת
    subtitle: string,
    // הטופס
    children: ReactNode
}

// כרטיס ממורכז לעמודי הכניסה ושינוי הסיסמה, כדי ששניהם ייראו אותו דבר
const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
    // ממורכז, ברוחב של טופס
    <div className="mx-auto w-full max-w-md py-4 sm:py-10">
        {/* הכרטיס, עם צל גדול */}
        <div className="card p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            {/* הסמל: ריבוע עם מעבר צבע וסימן שקל */}
            <LogoMark className="mx-auto mb-5 size-14 rounded-2xl text-2xl">₪</LogoMark>
            {/* הכותרת */}
            <h1 className="text-center text-2xl font-extrabold text-slate-900">{title}</h1>
            {/* ההסבר */}
            <p className="mt-1 mb-6 text-center text-sm text-slate-500">{subtitle}</p>
            {/* הטופס */}
            {children}
        </div>
    </div>
)

// מייצאים את הקומפוננטה
export default AuthCard
