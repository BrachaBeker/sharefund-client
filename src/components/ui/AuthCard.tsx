import type { ReactNode } from "react"
// עיצוב – לא לוגיקה
import LogoMark from "../../design/LogoMark"
import AuthShowcase from "../../design/AuthShowcase"

interface AuthCardProps {
    title: string,
    subtitle: string,
    children: ReactNode
}

const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-12 py-4 sm:py-8 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-sm">
            <LogoMark className="mb-6 size-12 text-xl" />
            <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-2 mb-8 text-slate-500">{subtitle}</p>
            <div className="card">{children}</div>
        </div>

        {/* עיצוב – לא לוגיקה */}
        <AuthShowcase />
    </div>
)

export default AuthCard
