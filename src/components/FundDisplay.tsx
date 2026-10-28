import { useId, useState } from "react"
import { amountClass, formatMoney } from "../utils/format"
import CardTitle from "./ui/CardTitle"

interface FundDisplayProps {
    fundBalance: number,
    totalDeposited: number
}

interface MoneyFlow {
    id: number,
    amount: number
}

// מידות הציור: הגובה של צנצנת מלאה, המדף (קו ה-0) שהצנצנת עומדת עליו, והעומק המקסימלי של החוב מתחתיו
const FULL_Y = 92
const ZERO_Y = 250
const DEBT_HEIGHT = 40
// ערימת המטבעות: שורות של מטבעות עם הזזה קטנה בכל שורה, כדי שזה ייראה כמו ערימה ולא כמו טבלה
const COINS = Array.from({ length: Math.ceil((ZERO_Y - FULL_Y) / 6) + 2 }, (_, row) =>
    Array.from({ length: 9 }, (_, column) => ({
        x: 18 + column * 20 + ((row * 13) % 20) - 10,
        y: FULL_Y + row * 6 + ((row * 7 + column * 5) % 3) - 1,
        color: ["#fbbf24", "#fcd34d", "#f59e0b"][(row + column * 2) % 3],
    }))
).flat()
const JAR_PATH = "M66 52 C66 64 32 66 32 92 L32 236 Q32 250 46 250 L154 250 Q168 250 168 236 L168 92 C168 66 134 64 134 52 Z"

// הקופה: צנצנת זכוכית עם מטבעות שעומדת על מדף. המדף הוא קו ה-0.
// כמה שיותר כסף בקופה – המטבעות עולים גבוה יותר. קופה במינוס: הצנצנת ריקה ופס אדום יורד מתחת למדף.
// בכל שינוי ביתרה מטבעות נופלים לתוך הצנצנת (הפקדה) או יוצאים ממנה (משיכה)
const FundDisplay = ({ fundBalance, totalDeposited }: FundDisplayProps) => {
    const id = useId()
    const [previousBalance, setPreviousBalance] = useState(fundBalance)
    const [flow, setFlow] = useState<MoneyFlow | null>(null)

    // היתרה השתנתה מאז הציור הקודם: מפעילים את האנימציה של הכסף
    if (fundBalance !== previousBalance) {
        setPreviousBalance(fundBalance)
        setFlow({ id: (flow?.id ?? 0) + 1, amount: fundBalance - previousBalance })
    }

    const isNegative = fundBalance < 0
    const max = Math.max(totalDeposited, fundBalance, 1)
    const fillHeight = (isNegative ? 0 : fundBalance / max) * (ZERO_Y - FULL_Y)
    // חוב קטן עדיין מקבל פס בגובה שאפשר לראות
    const debtHeight = isNegative ? Math.max(Math.min(-fundBalance / max, 1), 0.4) * DEBT_HEIGHT : 0
    const percentLeft = totalDeposited > 0 ? Math.round((fundBalance / totalDeposited) * 100) : 0
    const isDeposit = (flow?.amount ?? 0) > 0

    return (
        <section className={`card ${isNegative ? "border-rose-200" : ""}`}>
            <CardTitle
                title="מצב הקופה"
                actions={isNegative
                    ? <span className="badge bg-rose-100 text-rose-700">במינוס</span>
                    : <span className="badge bg-emerald-50 text-emerald-700">תקינה</span>}
            />

            <div className="flex flex-wrap items-center gap-6">
                <div className="relative mx-auto w-48 shrink-0">
                    <svg viewBox="0 0 220 300" className="w-full overflow-visible" role="img" aria-label={`יתרת הקופה ${formatMoney(fundBalance)} מתוך הפקדות של ${formatMoney(totalDeposited)}`}>
                        <defs>
                            <linearGradient id={`${id}-glass`} x1="0" x2="1">
                                <stop offset="0" stopColor="#0f172a" stopOpacity="0.22" />
                                <stop offset="0.25" stopColor="#0f172a" stopOpacity="0" />
                                <stop offset="0.75" stopColor="#0f172a" stopOpacity="0" />
                                <stop offset="1" stopColor="#0f172a" stopOpacity="0.28" />
                            </linearGradient>
                            <linearGradient id={`${id}-lid`} x1="0" x2="1">
                                <stop offset="0" stopColor="#334155" />
                                <stop offset="0.35" stopColor="#64748b" />
                                <stop offset="1" stopColor="#1e293b" />
                            </linearGradient>
                            <clipPath id={`${id}-jar`}><path d={JAR_PATH} /></clipPath>
                        </defs>

                        <ellipse cx="110" cy={ZERO_Y + 2} rx="80" ry="5" fill="#0f172a" opacity="0.12" />

                        <g transform="translate(10 0)">
                            <path d={JAR_PATH} fill="#f1f5f9" />

                            <g clipPath={`url(#${id}-jar)`}>
                                <g className="transition-all duration-1000 ease-out" opacity={fillHeight > 0 ? 1 : 0} style={{ transform: `translateY(${ZERO_Y - FULL_Y - fillHeight}px)` }}>
                                    <rect x="0" y={FULL_Y + 4} width="200" height={ZERO_Y - FULL_Y} fill="#b45309" />
                                    {COINS.map((coin) => (
                                        <g key={`${coin.x}-${coin.y}`}>
                                            <ellipse cx={coin.x} cy={coin.y + 2} rx="10" ry="4" fill="#b45309" />
                                            <ellipse cx={coin.x} cy={coin.y} rx="10" ry="4" fill={coin.color} stroke="#d97706" strokeWidth="0.7" />
                                        </g>
                                    ))}
                                </g>
                                <rect x="0" y="0" width="200" height={ZERO_Y} fill={`url(#${id}-glass)`} />
                            </g>

                            <path d={JAR_PATH} fill="none" stroke="#94a3b8" strokeWidth="3" />
                            <path d="M46 104 L46 232" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.65" />
                            <path d="M150 112 L150 150" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

                            <rect x="58" y="30" width="84" height="24" rx="5" fill={`url(#${id}-lid)`} />
                            <rect x="58" y="30" width="84" height="6" rx="3" fill="#94a3b8" opacity="0.6" />
                            <rect x="80" y="38" width="40" height="6" rx="3" fill="#0f172a" />

                            {flow && [0, 1, 2].map((index) => (
                                <g key={`${flow.id}-${index}`} className={isDeposit ? "coin-in" : "coin-out"} style={{ animationDelay: `${index * 180}ms` }}>
                                    <circle cx="100" cy="43" r="11" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
                                    <text x="100" y="47.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400e">₪</text>
                                </g>
                            ))}
                        </g>

                        {isNegative && (
                            <g>
                                <rect x="52" y={ZERO_Y} width="116" height={debtHeight} rx="4" fill="#f43f5e" />
                                <text x="110" y={ZERO_Y + debtHeight / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill="#ffffff">חוב</text>
                            </g>
                        )}
                        <line x1="28" x2="212" y1={ZERO_Y} y2={ZERO_Y} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                        <text x="12" y={ZERO_Y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">0</text>
                    </svg>

                    {flow && (
                        <span
                            key={flow.id}
                            dir="ltr"
                            className={`money-label absolute inset-x-0 top-0 text-center text-sm font-semibold tabular-nums ${isDeposit ? "text-emerald-600" : "text-rose-600"}`}
                            onAnimationEnd={() => setFlow(null)}
                        >
                            {isDeposit ? "+" : "−"}{formatMoney(Math.abs(flow.amount))}
                        </span>
                    )}
                </div>

                <div className="min-w-48 flex-1 space-y-4">
                    <div>
                        <p className="text-sm text-slate-500">יתרת הקופה</p>
                        <p className={`text-3xl font-bold tabular-nums ${amountClass(fundBalance)}`}>{formatMoney(fundBalance)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">סך ההפקדות</p>
                        <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatMoney(totalDeposited)}</p>
                    </div>
                    <p className={`text-sm ${isNegative ? "text-rose-700" : "text-slate-500"}`}>
                        {isNegative ? "הוצא יותר ממה שהופקד. כדאי לבקש מהחברים להפקיד." : `נשארו בקופה ${percentLeft}% מכל ההפקדות.`}
                    </p>
                </div>
            </div>
        </section>
    )
}

export default FundDisplay
