import { useEffect, useState } from "react"
import Icon from "./Icon"
import { formatMoney } from "../utils/format"
import { useCountUp } from "./useCountUp"

const AuthShowcase = () => {
    const shownBalance = useCountUp(1240, 2000)
    const shownPercent = Math.round(useCountUp(62, 2000))
    const [isBarDrawn, setIsBarDrawn] = useState(false)

    useEffect(() => {
        const frame = requestAnimationFrame(() => requestAnimationFrame(() => setIsBarDrawn(true)))
        return () => cancelAnimationFrame(frame)
    }, [])

    return (
        <div className="relative isolate hidden h-[560px] overflow-hidden rounded-[2.5rem] bg-linear-to-bl from-brand-500 via-brand-600 to-indigo-900 p-10 text-white shadow-2xl shadow-brand-700/30 lg:block" aria-hidden="true">
            <span className="blob-drift absolute -top-20 -left-16 -z-10 size-72 rounded-full bg-fuchsia-400/30 blur-2xl" />
            <span className="blob-drift absolute -right-10 -bottom-24 -z-10 size-80 rounded-full bg-accent-400/30 blur-2xl [animation-delay:-5s]" />

            <h2 className="text-3xl leading-tight font-extrabold text-white">הקופה של כולם,<br />במקום אחד.</h2>
            <p className="mt-3 max-w-xs text-white/75">מי הפקיד, על מה הוצאנו, ומה היתרה של כל אחד – הכול מתעדכן מיד.</p>

            <div className="float absolute top-56 right-10 w-64 -rotate-3 rounded-3xl bg-white p-5 text-ink shadow-2xl">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">יתרת הקופה</p>
                    <span className="badge bg-emerald-50 text-emerald-700">תקינה</span>
                </div>
                <p className="mt-1 grid text-3xl font-bold tabular-nums">
                    <span className="invisible [grid-area:1/1]">{formatMoney(1240)}</span>
                    <span className="[grid-area:1/1]">{formatMoney(shownBalance)}</span>
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-100">
                    <div className={`h-full rounded-full bg-brand-600 transition-[width] duration-[2000ms] ease-out ${isBarDrawn ? "w-[62%]" : "w-0"}`} />
                </div>
                <p className="mt-2 text-xs text-slate-500">נשארו {shownPercent}% מכל ההפקדות</p>
            </div>

            <div className="float absolute bottom-24 left-8 flex items-center gap-3 rounded-2xl bg-white py-3 ps-3 pe-5 text-ink shadow-2xl [animation-delay:-2s]">
                <span className="grid size-10 place-items-center rounded-full bg-emerald-500 text-white"><Icon name="arrowDown" className="size-5" /></span>
                <div>
                    <p className="text-xs text-slate-500">קופת ועד הכיתה · עכשיו</p>
                    <p className="text-sm font-semibold">נועה הפקידה 50 ₪</p>
                </div>
            </div>

            <div className="float absolute right-12 bottom-10 flex items-center gap-3 rounded-full bg-white/15 py-2 ps-2 pe-4 backdrop-blur-md [animation-delay:-4s]">
                <span className="flex -space-x-2 rtl:space-x-reverse">
                    {["bg-sky-400", "bg-accent-400", "bg-emerald-400", "bg-fuchsia-400"].map((color, index) => (
                        <span key={color} className={`grid size-8 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-brand-600 ${color}`}>{"נדמי"[index]}</span>
                    ))}
                </span>
                <span className="text-sm font-medium">12 חברים בקבוצה</span>
            </div>

            {["top-44 left-16", "top-[60%] right-[58%] [animation-delay:-3s]"].map((place) => (
                <span key={place} className={`float absolute grid size-11 place-items-center rounded-full bg-amber-300 font-bold text-amber-800 shadow-lg ring-4 ring-amber-200/50 ${place}`}>₪</span>
            ))}
        </div>
    )
}

export default AuthShowcase
