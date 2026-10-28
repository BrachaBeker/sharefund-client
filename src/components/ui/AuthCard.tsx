import type { ReactNode } from "react"
import LogoMark from "./LogoMark"

interface AuthCardProps {
    title: string,
    subtitle: string,
    children: ReactNode
}

// כרטיס ממורכז לעמודי הכניסה ושינוי הסיסמה, כדי ששניהם ייראו אותו דבר
const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
    <div className="mx-auto w-full max-w-sm py-4 sm:py-12">
        <LogoMark className="mx-auto mb-6 size-11 text-xl" />
        <h1 className="text-center text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 mb-6 text-center text-sm text-slate-500">{subtitle}</p>
        <div className="card">{children}</div>
    </div>
)

export default AuthCard
