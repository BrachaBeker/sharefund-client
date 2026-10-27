// useState: הסינונים, העמוד והתנועה שעורכים
import { useState } from "react"
// useQuery: טעינת ההיסטוריה. keepPreviousData: הטבלה לא נעלמת בזמן מעבר עמוד או סינון
import { keepPreviousData, useQuery } from "@tanstack/react-query"
// הקריאה לשרת
import { getTransactions } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הטיפוסים
import type { MemberFull, Transaction, TransactionCategory, TransactionsFilters, TransactionType } from "../types"
// הקבוצה הנוכחית, רשימת החברים, וחיפוש עם השהייה
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { useMembers } from "../hooks/useMembers"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
// עיצוב סכום, תאריך וצבע לפי סכום
import { amountClass, formatDateTime, formatMoney } from "../utils/format"
// שמות בעברית
import { categoryNames, typeNames } from "../utils/labels"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// הקומפוננטות של העמוד
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
  // סוג: הפקדה / משיכה / הכול ("")
  type: TransactionType | "",
  // קטגוריה, או הכול ("")
  category: TransactionCategory | "",
  // מנהל: מזהה החבר, או הכול ("")
  userId: string,
  // רק התנועות שלי
  mine: boolean,
  // מתאריך (YYYY-MM-DD), או ריק
  from: string,
  // עד תאריך (YYYY-MM-DD), או ריק
  to: string,
  // מהחדש לישן או מהישן לחדש
  sort: "newest" | "oldest"
}

// הסינונים ההתחלתיים: הכול, מהחדש לישן
const emptyFilters: FilterForm = { type: "", category: "", userId: "", mine: false, from: "", to: "", sort: "newest" }

// השם שמוצג בשורה. חבר רגיל מקבל userName רק בתנועות שלו, ובשאר מוצג טקסט כללי
const displayName = (tx: Transaction) => {
  // יש שם: מציגים אותו
  if (tx.userName) return tx.userName
  // הוצאה משותפת: שייכת לכל הקבוצה
  if (tx.isShared) return "הוצאה משותפת"
  // הפקדה של חבר אחר
  if (tx.type === "deposit") return "תשלום לקופה"
  // משיכה של חבר אחר
  return "משיכה של חבר"
}

// היסטוריה: טבלת תנועות עם סינונים, דפדוף ועריכה
function History() {
  // הקבוצה כבר טעונה ב-GroupLayout
  const { groupId, group } = useCurrentGroup()
  // האם המשתמש מנהל
  const isManager = group.role === "manager"

  // הסינונים בטופס
  const [form, setForm] = useState<FilterForm>(emptyFilters)
  // מה שהוקלד בחיפוש
  const [searchText, setSearchText] = useState("")
  // מספר העמוד
  const [page, setPage] = useState(1)
  // התנועה שעורכים (חלון פתוח), או null
  const [editing, setEditing] = useState<Transaction | null>(null)

  // החיפוש נשלח לשרת רק אחרי שהפסיקו להקליד
  const debouncedSearch = useDebouncedValue(searchText.trim())

  // הסינונים שנשלחים לשרת. שדות ריקים הופכים ל-undefined ולא נשלחים בכתובת
  const filters: TransactionsFilters = {
    // חיפוש
    search: debouncedSearch || undefined,
    // סוג
    type: form.type || undefined,
    // קטגוריה
    category: form.category || undefined,
    // חבר: רק למנהל
    userId: isManager && form.userId ? Number(form.userId) : undefined,
    // רק שלי: נשלח רק כשמסומן
    mine: form.mine || undefined,
    // מתאריך: מתחילת היום בשעון המקומי, כזמן ISO
    from: form.from ? new Date(`${form.from}T00:00:00`).toISOString() : undefined,
    // עד תאריך: עד סוף היום, כדי שגם התנועות של היום האחרון ייכללו
    to: form.to ? new Date(`${form.to}T23:59:59.999`).toISOString() : undefined,
    // מיון
    sort: form.sort,
    // עמוד
    page,
    // גודל עמוד
    pageSize: PAGE_SIZE,
  }

  // ההיסטוריה. כל שינוי בסינון או בעמוד = מפתח אחר = בקשה חדשה
  const { data, isLoading, isError, error, isFetching } = useQuery({
    // המפתח כולל את כל הסינונים
    queryKey: queryKeys.transactions(groupId, filters),
    // הבקשה
    queryFn: () => getTransactions({ groupId, filters }),
    // הטבלה הקודמת נשארת עד שהחדשה מגיעה
    placeholderData: keepPreviousData,
  })

  // מנהל: רשימת החברים לסינון לפי חבר (אותו מפתח כמו בעמוד החברים)
  const { data: members } = useMembers(groupId, {}, isManager)

  // שינוי סינון אחד. כל שינוי מחזיר לעמוד 1
  const changeFilter = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    // מעדכנים רק את השדה הזה
    setForm((current) => ({ ...current, [key]: value }))
    // חוזרים לעמוד הראשון
    setPage(1)
  }

  // ניקוי כל הסינונים
  const clearFilters = () => {
    // הסינונים ההתחלתיים
    setForm(emptyFilters)
    // החיפוש
    setSearchText("")
    // עמוד ראשון
    setPage(1)
  }

  // האם יש סינון פעיל (כדי להציג את כפתור הניקוי)
  const hasActiveFilters = searchText !== "" || JSON.stringify(form) !== JSON.stringify(emptyFilters)
  // מספר העמודים הכולל (לפחות 1)
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    // fragment: כל חלקי העמוד
    <>
      {/* הכותרת */}
      <PageHeader title="היסטוריית תנועות" subtitle={isManager ? "כל ההפקדות והמשיכות בקבוצה" : "שמות מוצגים רק בתנועות שלך. בשאר התנועות מוצג תיאור כללי."} />

      {/* שלושת כרטיסי הנתונים. summary לא מושפע מהסינון */}
      {data && (
        // גריד: אחד מתחת לשני בטלפון, שלושה בשורה במסך רחב
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* סך ההפקדות */}
          <StatCard label="סך כל ההפקדות" value={formatMoney(data.summary.totalDeposited)} icon="arrowDown" tone="bg-emerald-100 text-emerald-600" />
          {/* יתרת הקופה */}
          <StatCard label="יתרת הקופה" value={formatMoney(data.summary.fundBalance)} icon="wallet" tone="bg-teal-100 text-teal-600" valueClass={amountClass(data.summary.fundBalance)} />
          {/* מספר התנועות שעונות על הסינון */}
          <StatCard label={hasActiveFilters ? "תנועות שנמצאו" : "מספר התנועות"} value={data.total.toLocaleString("he-IL")} icon="clock" tone="bg-sky-100 text-sky-600" />
        </div>
      )}

      {/* הסינונים */}
      <section className="card mb-6 p-4 sm:p-5">
        {/* גריד של שדות: שניים בשורה בטלפון, ארבעה במסך רחב */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* החיפוש: תמיד שתי עמודות. כל הקלדה מחזירה לעמוד 1 */}
          <SearchInput
            value={searchText}
            onChange={(value) => { setSearchText(value); setPage(1) }}
            placeholder={isManager ? "חיפוש בהערה או בשם החבר" : "חיפוש בהערה"}
            className="col-span-2"
          />
          {/* הסוג */}
          <select value={form.type} onChange={(e) => changeFilter("type", e.target.value as FilterForm["type"])} className="input" aria-label="סוג">
            {/* הכול */}
            <option value="">כל הסוגים</option>
            {/* הפקדה ומשיכה */}
            {Object.entries(typeNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
          </select>
          {/* הקטגוריה */}
          <select value={form.category} onChange={(e) => changeFilter("category", e.target.value as FilterForm["category"])} className="input" aria-label="קטגוריה">
            {/* הכול */}
            <option value="">כל הקטגוריות</option>
            {/* כל קטגוריה */}
            <CategoryOptions />
          </select>
          {/* מתאריך: בטלפון שורה שלמה, כי שדה תאריך צריך רוחב */}
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-500 sm:col-span-1">
            {/* התווית */}
            <span className="shrink-0">מ-</span>
            {/* בחירת תאריך. max: לא אחרי תאריך הסיום */}
            <input type="date" value={form.from} max={form.to || undefined} onChange={(e) => changeFilter("from", e.target.value)} className="input" />
          </label>
          {/* עד תאריך: בטלפון שורה שלמה */}
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-500 sm:col-span-1">
            {/* התווית */}
            <span className="shrink-0">עד</span>
            {/* בחירת תאריך. min: לא לפני תאריך ההתחלה */}
            <input type="date" value={form.to} min={form.from || undefined} onChange={(e) => changeFilter("to", e.target.value)} className="input" />
          </label>
          {/* מנהל: בחירת חבר */}
          {isManager && (
            // רשימה נפתחת של החברים
            <select value={form.userId} onChange={(e) => changeFilter("userId", e.target.value)} className="input" aria-label="חבר">
              {/* הכול */}
              <option value="">כל החברים</option>
              {/* חבר לכל אפשרות */}
              {(members as MemberFull[] | undefined)?.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}
            </select>
          )}
          {/* המיון. לחבר רגיל (בלי בחירת חבר) הוא לבד בשורה, ולכן תופס שתי עמודות בטלפון */}
          <select value={form.sort} onChange={(e) => changeFilter("sort", e.target.value as FilterForm["sort"])} className={`input ${isManager ? "" : "col-span-2 sm:col-span-1"}`} aria-label="מיון">
            {/* מהחדש */}
            <option value="newest">מהחדש לישן</option>
            {/* מהישן */}
            <option value="oldest">מהישן לחדש</option>
          </select>
        </div>
        {/* שורה תחתונה: "רק שלי" וכפתור הניקוי */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {/* רק התנועות שלי: מתג */}
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            {/* תיבת הסימון */}
            <input type="checkbox" checked={form.mine} onChange={(e) => changeFilter("mine", e.target.checked)} className="size-4 accent-teal-600" />
            {/* הטקסט */}
            רק התנועות שלי
          </label>
          {/* ניקוי: רק כשיש סינון */}
          {hasActiveFilters && <button type="button" onClick={clearFilters} className="btn-ghost btn-sm"><Icon name="close" className="size-4" />ניקוי הסינון</button>}
        </div>
      </section>

      {/* טעינה ראשונה */}
      {isLoading && <LoadingState text="טוען תנועות..." />}
      {/* שגיאה */}
      {isError && <ErrorState title="לא ניתן לטעון את ההיסטוריה" text={getErrorMessage(error)} />}

      {/* אין תנועות */}
      {data && data.items.length === 0 && (
        // הטקסט לפי המצב: אין בכלל, או אין לפי הסינון
        <EmptyState
          title={hasActiveFilters ? "לא נמצאו תנועות" : "עוד אין תנועות"}
          text={hasActiveFilters ? "נסו לשנות או לנקות את הסינון." : "ההפקדה הראשונה באזור האישי תופיע כאן."}
          icon={hasActiveFilters ? "search" : "clock"}
        />
      )}

      {/* הטבלה */}
      {data && data.items.length > 0 && (
        // כרטיס בלי ריווח פנימי. שקוף קצת בזמן טעינת עמוד חדש
        <section className={`card overflow-hidden p-0 transition-opacity sm:p-0 ${isFetching ? "opacity-60" : ""}`}>
          {/* גלילה בתוך הטבלה בטלפון */}
          <div className="table-wrap">
            {/* הטבלה */}
            <table className="table">
              {/* הכותרות */}
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
              {/* השורות */}
              <tbody>
                {/* שורה לכל תנועה */}
                {data.items.map((tx) => (
                  // התנועות שלי מודגשות ברקע עדין
                  <tr key={tx.id} className={tx.isMine ? "bg-teal-50/40" : ""}>
                    {/* התאריך והשעה */}
                    <td className="whitespace-nowrap text-slate-500">{formatDateTime(tx.createdAt)}</td>
                    {/* השם, ומתחתיו מי רשם (אם זה מישהו אחר) */}
                    <td className="whitespace-nowrap">
                      {/* השם: אפור ונטוי כשזה טקסט כללי */}
                      <p className={tx.userName ? "font-medium text-slate-800" : "text-slate-400 italic"}>{displayName(tx)}</p>
                      {/* מי רשם: רק כשהמנהל רשם עבור החבר */}
                      {tx.recordedByName && tx.recordedByName !== tx.userName && <p className="text-xs text-slate-400">נרשם ע"י {tx.recordedByName}</p>}
                    </td>
                    {/* הסוג: תג ירוק או אדום, ובמשיכה משותפת גם תג "משותפת" */}
                    <td className="whitespace-nowrap">
                      {/* הסוג */}
                      <span className={`badge ${tx.type === "deposit" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{typeNames[tx.type]}</span>
                      {/* משותפת */}
                      {tx.isShared && <span className="badge ms-1 bg-amber-100 text-amber-800">משותפת</span>}
                    </td>
                    {/* הקטגוריה */}
                    <td className="whitespace-nowrap text-slate-600">{categoryNames[tx.category]}</td>
                    {/* הסכום: + בהפקדה, − במשיכה */}
                    <td className={`font-bold whitespace-nowrap ${tx.type === "deposit" ? "positive" : "negative"}`} dir="ltr">
                      {/* הסימן והסכום */}
                      {tx.type === "deposit" ? "+" : "−"}{formatMoney(tx.amount)}
                    </td>
                    {/* ההערה: נחתכת כשהיא ארוכה, והטקסט המלא מופיע בריחוף */}
                    <td className="max-w-56 truncate text-slate-600" title={tx.note}>{tx.note || <span className="text-slate-300">—</span>}</td>
                    {/* יתרת הקופה אחרי הפעולה */}
                    <td className={`whitespace-nowrap ${amountClass(tx.fundBalanceAfter)}`}>{formatMoney(tx.fundBalanceAfter)}</td>
                    {/* עריכה: בקבוצה פעילה, למנהל בכל שורה ולחבר רק בתנועות שלו */}
                    <td>
                      {/* האם מותר לערוך */}
                      {group.isActive && (isManager || tx.isMine) && (
                        // כפתור עיפרון קטן
                        <button type="button" onClick={() => setEditing(tx)} className="btn-ghost btn-sm" aria-label="עריכה" title="עריכת קטגוריה והערה">
                          {/* סמל עיפרון */}
                          <Icon name="pencil" className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* הדפדוף */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row">
            {/* אילו שורות מוצגות מתוך כמה */}
            <p>
              {/* למשל: 1–20 מתוך 57 */}
              מוצגות {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} מתוך {data.total}
            </p>
            {/* הכפתורים */}
            <div className="flex items-center gap-2">
              {/* הקודם: מושבת בעמוד הראשון. באתר מימין לשמאל, "הקודם" מצביע ימינה */}
              <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="btn-secondary btn-sm">
                {/* חץ ימינה */}
                <Icon name="chevronRight" className="size-4" />
                {/* הטקסט */}
                הקודם
              </button>
              {/* מספר העמוד */}
              <span className="px-2 font-medium text-slate-700">עמוד {data.page} מתוך {totalPages}</span>
              {/* הבא: מושבת בעמוד האחרון */}
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="btn-secondary btn-sm">
                {/* הטקסט */}
                הבא
                {/* חץ שמאלה */}
                <Icon name="chevronLeft" className="size-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* חלון העריכה */}
      {editing && <EditTransactionDialog groupId={groupId} transaction={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

// מייצאים את הקומפוננטה
export default History
