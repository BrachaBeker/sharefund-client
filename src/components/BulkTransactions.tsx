import { useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBulkTransactions } from "../services/api"
import { refreshAfterMoneyChange } from "../services/queryKeys"
import type { MemberFull, TransactionCategory, TransactionType } from "../types"
import { amountClass, formatMoney } from "../utils/format"
import { getErrorMessage } from "../utils/errors"
import { typeNames } from "../utils/labels"
import { hasAtMostTwoDecimals, MAX_AMOUNT } from "../utils/validation"
import Alert from "./ui/Alert"
import CardTitle from "./ui/CardTitle"
import CategoryOptions from "./ui/CategoryOptions"
import FormField from "./ui/FormField"
import Segmented from "./ui/Segmented"

interface BulkTransactionsProps {
    groupId: number,
    members: MemberFull[]
}

// מה שהוקלד לחבר אחד
interface Entry {
    amount: string,
    type: TransactionType
}

interface BulkItem {
    userId: number,
    amount: number,
    type: TransactionType
}

const emptyEntry: Entry = { amount: "", type: "deposit" }

const typeOptions = (["deposit", "withdraw"] as const).map((type) => ({ value: type, label: typeNames[type] }))

// רישום מרוכז (מנהל): ליד כל חבר שדה סכום ובחירת הפקדה או משיכה, ושמירה אחת.
// השרת מקבל סוג אחד בכל בקשה, ולכן נשלחות עד שתי בקשות: אחת להפקדות ואחת למשיכות
const BulkTransactions = ({ groupId, members }: BulkTransactionsProps) => {
    const queryClient = useQueryClient()
    const [entries, setEntries] = useState<Record<number, Entry>>({})
    const [category, setCategory] = useState<TransactionCategory>("general")
    const [note, setNote] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const mutation = useMutation({
        mutationFn: async (items: BulkItem[]) => {
            for (const type of ["deposit", "withdraw"] as const) {
                const itemsOfType = items
                    .filter((item) => item.type === type)
                    .map(({ userId, amount }) => ({ userId, amount }))
                if (itemsOfType.length > 0) {
                    await createBulkTransactions({ groupId, input: { type, category, note: note.trim(), items: itemsOfType } })
                }
            }
        },
        onSuccess: (_data, items) => {
            setSuccessMessage(`נשמרו ${items.length} פעולות בהצלחה.`)
            setEntries({})
            setNote("")
        },
        onError: (error) => setErrorMessage(getErrorMessage(error)),
        onSettled: () => refreshAfterMoneyChange(queryClient, groupId)
    })

    const changeEntry = (userId: number, change: Partial<Entry>) => {
        setEntries((current) => ({
            ...current,
            [userId]: { ...(current[userId] ?? emptyEntry), ...change }
        }))
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")
        setSuccessMessage("")

        let hasInvalidAmount = false
        const items = members.flatMap((member) => {
            const entry = entries[member.userId]
            if (!entry || entry.amount.trim() === "") return []
            const amount = Number(entry.amount)
            if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT || !hasAtMostTwoDecimals(amount)) {
                hasInvalidAmount = true
                return []
            }
            return [{ userId: member.userId, amount, type: entry.type }]
        })

        if (hasInvalidAmount) {
            setErrorMessage("כל סכום חייב להיות גדול מ-0, עד 1,000,000, ועם עד שתי ספרות אחרי הנקודה.")
            return
        }
        if (items.length === 0) {
            setErrorMessage("יש להזין סכום לחבר אחד לפחות.")
            return
        }
        mutation.mutate(items)
    }

    const filledCount = Object.values(entries).filter((entry) => entry.amount.trim() !== "").length

    return (
        <form onSubmit={handleSubmit} noValidate className="card space-y-5">
            <CardTitle title="רישום מרוכז של הפקדות ומשיכות" subtitle="ממלאים סכום רק לחברים שרוצים לרשום להם פעולה. שורות ריקות לא נשלחות." />

            <div className="grid gap-3 sm:grid-cols-3">
                <FormField label="קטגוריה לכל הפעולות" htmlFor="bulk-category">
                    <select id="bulk-category" className="input" value={category} onChange={(e) => setCategory(e.target.value as TransactionCategory)} disabled={mutation.isPending}>
                        <CategoryOptions />
                    </select>
                </FormField>
                <FormField label="הערה (לא חובה)" htmlFor="bulk-note" className="sm:col-span-2">
                    <input id="bulk-note" className="input" maxLength={300} placeholder="למשל: גבייה למסיבת סוף שנה" value={note} onChange={(e) => setNote(e.target.value)} disabled={mutation.isPending} />
                </FormField>
            </div>

            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {members.map((member) => {
                    const entry = entries[member.userId] ?? emptyEntry
                    return (
                        <li key={member.userId} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${entry.amount ? "bg-brand-50/50" : ""}`}>
                            <div className="min-w-36 flex-1">
                                <p className="font-medium text-slate-800">{member.name}</p>
                                <p className="text-xs text-slate-500">יתרה: <span className={`font-medium tabular-nums ${amountClass(member.balance)}`}>{formatMoney(member.balance)}</span></p>
                            </div>
                            <Segmented
                                label={`סוג פעולה עבור ${member.name}`}
                                options={typeOptions}
                                value={entry.type}
                                onChange={(type) => changeEntry(member.userId, { type })}
                                disabled={mutation.isPending}
                            />
                            <input
                                aria-label={`סכום עבור ${member.name}`}
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={entry.amount}
                                onChange={(event) => changeEntry(member.userId, { amount: event.target.value })}
                                disabled={mutation.isPending}
                                placeholder="סכום ₪"
                                className="input w-32"
                            />
                        </li>
                    )
                })}
            </ul>

            {errorMessage && <Alert>{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <button type="submit" disabled={mutation.isPending} className="btn-primary">
                {mutation.isPending ? "שומר..." : `שמירת הפעולות${filledCount ? ` (${filledCount})` : ""}`}
            </button>
        </form>
    )
}

export default BulkTransactions
