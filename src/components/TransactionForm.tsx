import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTransaction } from "../services/api"
import { refreshAfterMoneyChange } from "../services/queryKeys"
import type { CreateTransactionInput, TransactionType } from "../types"
import { getErrorMessage } from "../utils/errors"
import { typeNames } from "../utils/labels"
import { amountRules, noteRules } from "../utils/validation"
import FormField from "./ui/FormField"
import CardTitle from "./ui/CardTitle"
import CategoryOptions from "./ui/CategoryOptions"
import Alert from "./ui/Alert"
import Icon, { type IconName } from "./ui/Icon"

const typeButtons: { type: TransactionType, icon: IconName, active: string }[] = [
    { type: "deposit", icon: "arrowDown", active: "border-emerald-500 bg-emerald-50 text-emerald-700" },
    { type: "withdraw", icon: "arrowUp", active: "border-rose-500 bg-rose-50 text-rose-700" },
]

// הפקדה או משיכה של המשתמש המחובר (באזור האישי)
const TransactionForm = ({ groupId }: { groupId: number }) => {
    const queryClient = useQueryClient()
    const [type, setType] = useState<TransactionType | null>(null)
    const [isPersonal, setIsPersonal] = useState(false)
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CreateTransactionInput>({
        defaultValues: { category: "general", note: "" }
    })
    const amount = useWatch({ control, name: "amount" })

    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            refreshAfterMoneyChange(queryClient, groupId)
            close()
        }
    })

    const open = (newType: TransactionType) => {
        mutation.reset()
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

    return (
        <section className="card">
            <CardTitle title="פעולה בקופה" subtitle="בוחרים הפקדה או משיכה וממלאים את הפרטים" />
            <div className="grid grid-cols-2 gap-3">
                {typeButtons.map((button) => (
                    <button
                        key={button.type}
                        type="button"
                        onClick={() => open(button.type)}
                        aria-pressed={type === button.type}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${type === button.type ? button.active : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                    >
                        <Icon name={button.icon} className="size-4" />
                        {typeNames[button.type]}
                    </button>
                ))}
            </div>

            {type && (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="סכום (₪)" htmlFor="tx-amount" error={errors.amount?.message}>
                            <input id="tx-amount" type="number" step="0.01" inputMode="decimal" placeholder="0.00" className="input" autoFocus {...register("amount", amountRules)} />
                        </FormField>
                        <FormField label="קטגוריה" htmlFor="tx-category">
                            <select id="tx-category" className="input" {...register("category")}>
                                <CategoryOptions />
                            </select>
                        </FormField>
                    </div>

                    <FormField label="הערה (לא חובה)" htmlFor="tx-note" error={errors.note?.message}>
                        <textarea id="tx-note" rows={2} placeholder="למשל: קניית כיבוד למפגש" className="input resize-none" {...register("note", noteRules)} />
                    </FormField>

                    {type === "withdraw" && (
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <input type="checkbox" checked={isPersonal} onChange={(e) => setIsPersonal(e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
                            <span className="text-sm">
                                <strong className="block font-medium text-slate-800">משיכה אישית: החזר כסף אליי</strong>
                                <span className="text-slate-500">
                                    {isPersonal
                                        ? "הכסף יורד רק מהיתרה שלך. מתאים למשל לפני יציאה מהקבוצה."
                                        : "בלי סימון, המשיכה היא הוצאה משותפת של הקבוצה, ומתחלקת שווה בין כל החברים."}
                                </span>
                            </span>
                        </label>
                    )}

                    {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}

                    <div className="form-actions">
                        <button type="submit" disabled={!amount || mutation.isPending} className={type === "deposit" ? "btn-primary" : "btn-danger"}>
                            {mutation.isPending ? "שולח..." : `אישור ${typeNames[type]}`}
                        </button>
                        <button type="button" onClick={close} className="btn-secondary">ביטול</button>
                    </div>
                </form>
            )}
        </section>
    )
}

export default TransactionForm
