import { useState } from "react"
import { formatMoney } from "../utils/format"
// עיצוב – לא לוגיקה
import { useCountUp } from "../design/useCountUp"
import Icon from "../design/Icon"

interface FundDisplayProps {
    fundBalance: number,
    totalDeposited: number
}

interface MoneyFlow {
    id: number,
    amount: number
}

// עיצוב – לא לוגיקה
const RING_LENGTH = 2 * Math.PI * 52

const FundDisplay = ({ fundBalance, totalDeposited }: FundDisplayProps) => {
    // עיצוב – לא לוגיקה
    const shownBalance = useCountUp(fundBalance)
    // עיצוב – לא לוגיקה
    const [previousBalance, setPreviousBalance] = useState(fundBalance)
    const [flow, setFlow] = useState<MoneyFlow | null>(null)

    if (fundBalance !== previousBalance) {
        setPreviousBalance(fundBalance)
        setFlow({ id: (flow?.id ?? 0) + 1, amount: fundBalance - previousBalance })
    }

    const isNegative = fundBalance < 0
    const percentLeft = totalDeposited > 0 ? Math.round((fundBalance / totalDeposited) * 100) : 0
    const ringFill = isNegative ? 1 : Math.min(Math.max(percentLeft, 0), 100) / 100
    const spent = totalDeposited - fundBalance
    const isDeposit = (flow?.amount ?? 0) > 0

    return (
        <section className="relative isolate overflow-hidden rounded-3xl bg-linear-to-bl from-brand-500 via-brand-600 to-indigo-800 p-6 text-white shadow-2xl shadow-brand-700/30 sm:p-8">
            {/* עיצוב – לא לוגיקה */}
            <span className="absolute -top-20 -left-16 -z-10 size-64 rounded-full bg-white/10" />
            <span className="absolute -right-12 -bottom-28 -z-10 size-72 rounded-full bg-fuchsia-400/20" />

            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">מצב הקופה</h2>
                {isNegative
                    ? <span className="badge animate-pulse bg-rose-500 text-white">במינוס</span>
                    : <span className="badge bg-white/15 text-white"><span className="size-1.5 rounded-full bg-emerald-300" />תקינה</span>}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
                <div className="relative min-w-0">
                    <p className="text-sm text-white/75">יתרת הקופה</p>
                    <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">{formatMoney(shownBalance)}</p>
                    <p className="mt-2 text-sm text-white/75">
                        {isNegative ? "הוצא יותר ממה שהופקד. כדאי לבקש מהחברים להפקיד." : `מתוך הפקדות של ${formatMoney(totalDeposited)}`}
                    </p>

                    {/* עיצוב – לא לוגיקה */}
                    {flow && (
                        <span
                            key={flow.id}
                            dir="ltr"
                            className={`money-label absolute -top-3 left-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold tabular-nums shadow-lg ${isDeposit ? "bg-emerald-400 text-emerald-950" : "bg-rose-400 text-rose-950"}`}
                            onAnimationEnd={() => setFlow(null)}
                        >
                            <Icon name={isDeposit ? "arrowDown" : "arrowUp"} className="size-3.5" />
                            {isDeposit ? "+" : "−"}{formatMoney(Math.abs(flow.amount))}
                        </span>
                    )}
                </div>

                {/* עיצוב – לא לוגיקה */}
                <div className="relative mx-auto size-32 shrink-0 sm:mx-0">
                    <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="11" />
                        <circle
                            cx="60" cy="60" r="52" fill="none"
                            stroke={isNegative ? "#fb7185" : "#ffffff"}
                            strokeWidth="11" strokeLinecap="round"
                            strokeDasharray={RING_LENGTH}
                            strokeDashoffset={RING_LENGTH * (1 - ringFill)}
                            className="transition-[stroke-dashoffset] duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 grid place-content-center text-center">
                        <span className="text-2xl font-bold tabular-nums">{isNegative ? "!" : `${percentLeft}%`}</span>
                        <span className="text-[11px] text-white/75">{isNegative ? "חוב" : "נשאר"}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/90 text-emerald-950"><Icon name="arrowDown" className="size-4" /></span>
                    <div className="min-w-0">
                        <p className="text-xs text-white/75">הופקד</p>
                        <p className="truncate font-semibold tabular-nums">{formatMoney(totalDeposited)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-300 text-accent-700"><Icon name="arrowUp" className="size-4" /></span>
                    <div className="min-w-0">
                        <p className="text-xs text-white/75">יצא</p>
                        <p className="truncate font-semibold tabular-nums">{formatMoney(spent)}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FundDisplay
