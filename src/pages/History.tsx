import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getTransactions } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { MemberFull, Transaction, TransactionCategory, TransactionsFilters, TransactionType } from "../types"
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { useMembers } from "../hooks/useMembers"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
import { amountClass, formatDateTime, formatMoney } from "../utils/format"
import { categoryNames, typeNames } from "../utils/labels"
import { getErrorMessage } from "../utils/errors"
import EditTransactionDialog from "../components/EditTransactionDialog"
import PageHeader from "../components/ui/PageHeader"
import StatCard from "../components/ui/StatCard"
import Icon from "../components/ui/Icon"
import SearchInput from "../components/ui/SearchInput"
import CategoryOptions from "../components/ui/CategoryOptions"
import { EmptyState, ErrorState, LoadingState } from "../components/ui/PageState"

// כמה תנועות בכל עמוד
const PAGE_SIZE = 20

// הסינונים כמו שהם בטופס (לפני ההמרה למה שנשלח לשרת)
interface FilterForm {
    type: TransactionType | "",
    category: TransactionCategory | "",
    userId: string,
    mine: boolean,
    from: string,
    to: string,
    sort: "newest" | "oldest"
}

// הסינונים ההתחלתיים: הכול, מהחדש לישן
const emptyFilters: FilterForm = { type: "", category: "", userId: "", mine: false, from: "", to: "", sort: "newest" }

// השם שמוצג בשורה. חבר רגיל מקבל userName רק בתנועות שלו, ובשאר מוצג טקסט כללי
const displayName = (tx: Transaction) => {
    if (tx.userName) return tx.userName
    if (tx.isShared) return "הוצאה משותפת"
    if (tx.type === "deposit") return "תשלום לקופה"
    return "משיכה של חבר"
}

// היסטוריה: טבלת תנועות עם סינונים, דפדוף ועריכה
const History = () => {
    const { groupId, group } = useCurrentGroup()
    const isManager = group.role === "manager"

    const [form, setForm] = useState<FilterForm>(emptyFilters)
    const [searchText, setSearchText] = useState("")
    const [page, setPage] = useState(1)
    const [editing, setEditing] = useState<Transaction | null>(null)

    const debouncedSearch = useDebouncedValue(searchText.trim())

    const filters: TransactionsFilters = {
        search: debouncedSearch || undefined,
        type: form.type || undefined,
        category: form.category || undefined,
        userId: isManager && form.userId ? Number(form.userId) : undefined,
        mine: form.mine || undefined,
        from: form.from ? new Date(`${form.from}T00:00:00`).toISOString() : undefined,
        to: form.to ? new Date(`${form.to}T23:59:59.999`).toISOString() : undefined,
        sort: form.sort,
        page,
        pageSize: PAGE_SIZE,
    }

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: queryKeys.transactions(groupId, filters),
        queryFn: () => getTransactions({ groupId, filters }),
        placeholderData: keepPreviousData,
    })

    const { data: members } = useMembers(groupId, {}, isManager)

    const changeFilter = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
        setForm((current) => ({ ...current, [key]: value }))
        setPage(1)
    }

    const clearFilters = () => {
        setForm(emptyFilters)
        setSearchText("")
        setPage(1)
    }

    const hasActiveFilters = searchText !== "" || JSON.stringify(form) !== JSON.stringify(emptyFilters)
    const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

    return (
        <>
            <PageHeader title="היסטוריית תנועות" subtitle={isManager ? "כל ההפקדות והמשיכות בקבוצה" : "שמות מוצגים רק בתנועות שלך. בשאר התנועות מוצג תיאור כללי."} />

            {data && (
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <StatCard label="סך כל ההפקדות" value={formatMoney(data.summary.totalDeposited)} icon="arrowDown" tone="bg-emerald-50 text-emerald-600" />
                    <StatCard label="יתרת הקופה" value={formatMoney(data.summary.fundBalance)} icon="wallet" tone="bg-brand-50 text-brand-600" valueClass={amountClass(data.summary.fundBalance)} />
                    <StatCard label={hasActiveFilters ? "תנועות שנמצאו" : "מספר התנועות"} value={data.total.toLocaleString("he-IL")} icon="clock" tone="bg-slate-100 text-slate-600" />
                </div>
            )}

            <section className="card mb-6 p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <SearchInput
                        value={searchText}
                        onChange={(value) => { setSearchText(value); setPage(1) }}
                        placeholder={isManager ? "חיפוש בהערה או בשם החבר" : "חיפוש בהערה"}
                        className="col-span-2"
                    />
                    <select value={form.type} onChange={(e) => changeFilter("type", e.target.value as FilterForm["type"])} className="input" aria-label="סוג">
                        <option value="">כל הסוגים</option>
                        {Object.entries(typeNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
                    </select>
                    <select value={form.category} onChange={(e) => changeFilter("category", e.target.value as FilterForm["category"])} className="input" aria-label="קטגוריה">
                        <option value="">כל הקטגוריות</option>
                        <CategoryOptions />
                    </select>
                    <label className="col-span-2 flex items-center gap-2 text-sm text-slate-500 sm:col-span-1">
                        <span className="shrink-0">מ-</span>
                        <input type="date" value={form.from} max={form.to || undefined} onChange={(e) => changeFilter("from", e.target.value)} className="input" />
                    </label>
                    <label className="col-span-2 flex items-center gap-2 text-sm text-slate-500 sm:col-span-1">
                        <span className="shrink-0">עד</span>
                        <input type="date" value={form.to} min={form.from || undefined} onChange={(e) => changeFilter("to", e.target.value)} className="input" />
                    </label>
                    {isManager && (
                        <select value={form.userId} onChange={(e) => changeFilter("userId", e.target.value)} className="input" aria-label="חבר">
                            <option value="">כל החברים</option>
                            {(members as MemberFull[] | undefined)?.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}
                        </select>
                    )}
                    <select value={form.sort} onChange={(e) => changeFilter("sort", e.target.value as FilterForm["sort"])} className={`input ${isManager ? "" : "col-span-2 sm:col-span-1"}`} aria-label="מיון">
                        <option value="newest">מהחדש לישן</option>
                        <option value="oldest">מהישן לחדש</option>
                    </select>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="checkbox" checked={form.mine} onChange={(e) => changeFilter("mine", e.target.checked)} className="size-4 accent-brand-600" />
                        רק התנועות שלי
                    </label>
                    {hasActiveFilters && <button type="button" onClick={clearFilters} className="btn-ghost btn-sm"><Icon name="close" className="size-4" />ניקוי הסינון</button>}
                </div>
            </section>

            {isLoading && <LoadingState text="טוען תנועות..." />}
            {isError && <ErrorState title="לא ניתן לטעון את ההיסטוריה" text={getErrorMessage(error)} />}

            {data && data.items.length === 0 && (
                <EmptyState
                    title={hasActiveFilters ? "לא נמצאו תנועות" : "עוד אין תנועות"}
                    text={hasActiveFilters ? "נסו לשנות או לנקות את הסינון." : "ההפקדה הראשונה באזור האישי תופיע כאן."}
                    icon={hasActiveFilters ? "search" : "clock"}
                />
            )}

            {data && data.items.length > 0 && (
                <section className={`card overflow-hidden p-0 transition-opacity sm:p-0 ${isFetching ? "opacity-60" : ""}`}>
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>תאריך ושעה</th>
                                    <th>שם</th>
                                    <th>סוג</th>
                                    <th>קטגוריה</th>
                                    <th>סכום</th>
                                    <th>הערה</th>
                                    <th>יתרת הקופה אחרי</th>
                                    <th><span className="sr-only">עריכה</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((tx) => (
                                    <tr key={tx.id} className={tx.isMine ? "bg-brand-50/40" : ""}>
                                        <td className="whitespace-nowrap text-slate-500">{formatDateTime(tx.createdAt)}</td>
                                        <td className="whitespace-nowrap">
                                            <p className={tx.userName ? "font-medium text-slate-800" : "text-slate-400 italic"}>{displayName(tx)}</p>
                                            {tx.recordedByName && tx.recordedByName !== tx.userName && <p className="text-xs text-slate-400">נרשם ע"י {tx.recordedByName}</p>}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <span className={`badge ${tx.type === "deposit" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{typeNames[tx.type]}</span>
                                            {tx.isShared && <span className="badge ms-1 bg-amber-50 text-amber-800">משותפת</span>}
                                        </td>
                                        <td className="whitespace-nowrap text-slate-600">{categoryNames[tx.category]}</td>
                                        <td className={`font-semibold whitespace-nowrap tabular-nums ${tx.type === "deposit" ? "positive" : "negative"}`} dir="ltr">
                                            {tx.type === "deposit" ? "+" : "−"}{formatMoney(tx.amount)}
                                        </td>
                                        <td className="max-w-56 truncate text-slate-600" title={tx.note}>{tx.note || <span className="text-slate-300">—</span>}</td>
                                        <td className={`whitespace-nowrap tabular-nums ${amountClass(tx.fundBalanceAfter)}`}>{formatMoney(tx.fundBalanceAfter)}</td>
                                        <td>
                                            {group.isActive && (isManager || tx.isMine) && (
                                                <button type="button" onClick={() => setEditing(tx)} className="btn-ghost btn-sm" aria-label="עריכה" title="עריכת קטגוריה והערה">
                                                    <Icon name="pencil" className="size-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row">
                        <p>
                            מוצגות {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} מתוך {data.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="btn-secondary btn-sm">
                                <Icon name="chevronRight" className="size-4" />
                                הקודם
                            </button>
                            <span className="px-2 font-medium text-slate-700">עמוד {data.page} מתוך {totalPages}</span>
                            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="btn-secondary btn-sm">
                                הבא
                                <Icon name="chevronLeft" className="size-4" />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {editing && <EditTransactionDialog groupId={groupId} transaction={editing} onClose={() => setEditing(null)} />}
        </>
    )
}

export default History
