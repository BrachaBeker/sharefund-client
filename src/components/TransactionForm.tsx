import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTransaction } from "../services/api"
import { refreshAfterMoneyChange } from "../services/queryKeys"
import type { CreateTransactionInput, TransactionType } from "../types"
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { getErrorMessage } from "../utils/errors"
import { formatMoney } from "../utils/format"
import { categoryNames, typeNames } from "../utils/labels"
import { amountRules, noteRules } from "../utils/validation"
import FormField from "./ui/FormField"
import CardTitle from "./ui/CardTitle"
import Alert from "./ui/Alert"
import Icon, { type IconName } from "./ui/Icon"

const typeCards: { type: TransactionType, icon: IconName, text: string, color: string, glow: string }[] = [
    { type: "deposit", icon: "arrowDown", text: "מכניסים כסף לקופה", color: "from-emerald-400 to-teal-600", glow: "ring-emerald-300 shadow-emerald-500/30" },
    { type: "withdraw", icon: "arrowUp", text: "הוצאה משותפת או החזר אישי", color: "from-amber-400 to-accent-600", glow: "ring-accent-200 shadow-accent-500/30" },
]

const quickAmounts = [20, 50, 100, 200]

// הפקדה או משיכה של המשתמש המחובר (באזור האישי): בוחרים סוג, סכום וקטגוריה, ורואים מראש איך הקופה תשתנה
const TransactionForm = ({ groupId }: { groupId: number }) => {
    const queryClient = useQueryClient()
    const { group } = useCurrentGroup()
    const [type, setType] = useState<TransactionType | null>(null)
    const [isPersonal, setIsPersonal] = useState(false)
    const [doneType, setDoneType] = useState<TransactionType | null>(null)
    const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<CreateTransactionInput>({
        defaultValues: { category: "general", note: "" }
    })
    const amount = useWatch({ control, name: "amount" })
    const validAmount = Number.isFinite(amount) && amount > 0 ? amount : 0

    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            refreshAfterMoneyChange(queryClient, groupId)
            setDoneType(type)
            close()
        }
    })

    const open = (newType: TransactionType) => {
        mutation.reset()
        setDoneType(null)
        setType(newType)
    }

    const close = () => {
        reset()
        mutation.reset()
        setIsPersonal(false)
        setType(null)
    }

    const onSubmit = (input: CreateTransactionInput) =>
        mutation.mutate({ groupId, input: { ...input, type: type!, isShared: type === "withdraw" && !isPersonal } })

    // התצוגה המקדימה: הקופה זזה בכל הסכום. היתרה שלי זזה בכל הסכום, חוץ מהוצאה משותפת שמתחלקת בין כל החברים
    const sign = type === "deposit" ? 1 : -1
    const fundAfter = group.fundBalance + sign * validAmount
    const myChange = type === "withdraw" && !isPersonal ? -validAmount / group.membersCount : sign * validAmount

    return (
        <section className="card">
            <CardTitle title="פעולה בקופה" subtitle="בוחרים הפקדה או משיכה, וממלאים את הפרטים" />

            <div className="grid gap-4 sm:grid-cols-2">
                {typeCards.map((card) => {
                    const isActive = type === card.type
                    return (
                        <button
                            key={card.type}
                            type="button"
                            onClick={() => (isActive ? close() : open(card.type))}
                            aria-pressed={isActive}
                            className={`group relative isolate flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl bg-linear-to-br p-5 text-start text-white shadow-lg transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-xl ${card.color} ${isActive ? `ring-4 ${card.glow}` : ""} ${type && !isActive ? "opacity-50 saturate-50 hover:opacity-100 hover:saturate-100" : ""}`}
                        >
                            <span className="absolute -bottom-10 -left-8 -z-10 size-32 rounded-full bg-white/15 transition duration-500 group-hover:scale-150" />
                            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 transition duration-300 group-hover:scale-110 group-hover:-rotate-6">
                                <Icon name={card.icon} className="size-7" />
                            </span>
                            <span>
                                <span className="block text-xl font-bold">{typeNames[card.type]}</span>
                                <span className="text-sm text-white/85">{card.text}</span>
                            </span>
                            {isActive && <Icon name="close" className="ms-auto size-5 text-white/80" />}
                        </button>
                    )
                })}
            </div>

            {doneType && !type && (
                <div className="pop-in mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Icon name="check" className="size-5" /></span>
                    <p className="font-medium">ה{typeNames[doneType]} נרשמה בהצלחה! הקופה והיתרה שלך כבר מעודכנות.</p>
                </div>
            )}

            {type && (
                <form key={type} onSubmit={handleSubmit(onSubmit)} noValidate className="rise-in mt-6 space-y-6">
                    <div className="rounded-2xl bg-slate-50 p-5 text-center">
                        <label htmlFor="tx-amount" className="text-sm font-medium text-slate-500">כמה כסף?</label>
                        <div className="mt-1 flex items-baseline justify-center gap-2">
                            <input
                                id="tx-amount"
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="0"
                                className="w-48 [appearance:textfield] bg-transparent text-center text-5xl font-bold text-ink tabular-nums placeholder:text-slate-300 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                autoFocus
                                {...register("amount", amountRules)}
                            />
                            <span className="text-3xl font-bold text-slate-400">₪</span>
                        </div>
                        {errors.amount && <p className="field-error">{errors.amount.message}</p>}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {quickAmounts.map((quick) => (
                                <button
                                    key={quick}
                                    type="button"
                                    onClick={() => setValue("amount", quick, { shouldValidate: true })}
                                    className={`cursor-pointer rounded-full border-2 px-4 py-1.5 text-sm font-semibold tabular-nums transition duration-200 active:scale-95 ${validAmount === quick ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700"}`}
                                >
                                    {quick} ₪
                                </button>
                            ))}
                        </div>
                    </div>

                    <fieldset>
                        <legend className="label">קטגוריה</legend>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(categoryNames).map(([value, name]) => (
                                <label key={value} className="cursor-pointer">
                                    <input type="radio" value={value} className="peer sr-only" {...register("category")} />
                                    <span className="block rounded-full border-2 border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition duration-200 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600 hover:border-brand-300">
                                        {name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {type === "withdraw" && (
                        <fieldset>
                            <legend className="label">סוג המשיכה</legend>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    { personal: false, icon: "users" as IconName, title: "הוצאה משותפת", text: "מתחלקת שווה בין כל החברים" },
                                    { personal: true, icon: "wallet" as IconName, title: "החזר אישי אליי", text: "יורד רק מהיתרה שלי, למשל לפני יציאה" },
                                ].map((option) => (
                                    <button
                                        key={option.title}
                                        type="button"
                                        onClick={() => setIsPersonal(option.personal)}
                                        aria-pressed={isPersonal === option.personal}
                                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-start transition duration-200 ${isPersonal === option.personal ? "border-accent-400 bg-accent-50" : "border-slate-200 hover:border-accent-200"}`}
                                    >
                                        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isPersonal === option.personal ? "bg-accent-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                                            <Icon name={option.icon} className="size-4" />
                                        </span>
                                        <span>
                                            <span className="block font-semibold text-ink">{option.title}</span>
                                            <span className="text-sm text-slate-500">{option.text}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    <FormField label="הערה (לא חובה)" htmlFor="tx-note" error={errors.note?.message}>
                        <textarea id="tx-note" rows={2} placeholder="למשל: קניית כיבוד למפגש" className="input resize-none" {...register("note", noteRules)} />
                    </FormField>

                    {validAmount > 0 && (
                        <div className="pop-in grid gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">הקופה אחרי הפעולה</p>
                                <p className="font-semibold tabular-nums text-ink">{formatMoney(group.fundBalance)} ← {formatMoney(fundAfter)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">השינוי ביתרה שלך</p>
                                <p className={`font-semibold tabular-nums ${myChange >= 0 ? "positive" : "negative"}`} dir="ltr">{myChange >= 0 ? "+" : "−"}{formatMoney(Math.abs(myChange))}</p>
                            </div>
                        </div>
                    )}

                    {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}

                    <div className="form-actions">
                        <button type="submit" disabled={!validAmount || mutation.isPending} className={`${type === "deposit" ? "btn-primary" : "btn-accent"} flex-1 py-3 text-base sm:flex-none sm:px-8`}>
                            <Icon name={type === "deposit" ? "arrowDown" : "arrowUp"} className="size-5" />
                            {mutation.isPending ? "שולח..." : `אישור ${typeNames[type]}${validAmount ? ` של ${formatMoney(validAmount)}` : ""}`}
                        </button>
                        <button type="button" onClick={close} className="btn-secondary">ביטול</button>
                    </div>
                </form>
            )}
        </section>
    )
}

export default TransactionForm
