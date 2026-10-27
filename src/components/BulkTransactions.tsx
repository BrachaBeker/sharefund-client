// useState: הסכומים שהוקלדו וההודעות. FormEvent: הטיפוס של אירוע שליחת הטופס
import { useState, type FormEvent } from "react"
// useMutation: שליחה לשרת. useQueryClient: רענון הנתונים
import { useMutation, useQueryClient } from "@tanstack/react-query"
// הקריאה לשרת
import { createBulkTransactions } from "../services/api"
// רענון כל הנתונים שהשתנו אחרי פעולה כספית
import { refreshAfterMoneyChange } from "../services/queryKeys"
// הטיפוסים
import type { MemberFull, TransactionCategory, TransactionType } from "../types"
// עיצוב סכום וצבע לפי סכום
import { amountClass, formatMoney } from "../utils/format"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// שמות הסוגים בעברית
import { typeNames } from "../utils/labels"
// בדיקת שתי ספרות אחרי הנקודה, והסכום המקסימלי (אותם כללים כמו בטופס ההפקדה)
import { hasAtMostTwoDecimals, MAX_AMOUNT } from "../utils/validation"
// הודעה, שדה, אפשרויות הקטגוריה וסמלים
import Alert from "./ui/Alert"
import CategoryOptions from "./ui/CategoryOptions"
import FormField from "./ui/FormField"
import Icon from "./ui/Icon"

// מה הקומפוננטה מקבלת
interface BulkTransactionsProps {
  // מזהה הקבוצה
  groupId: number,
  // כל החברים בקבוצה (בלי סינון)
  members: MemberFull[]
}

// מה שהוקלד לחבר אחד
type Entry = {
  // שומרים את מה שהוקלד כמחרוזת עד שלוחצים שמירה
  amount: string,
  // הפקדה או משיכה
  type: TransactionType
}

// פריט אחד לשליחה, אחרי הבדיקה
type BulkItem = { userId: number, amount: number, type: TransactionType }

// הערך של חבר שעוד לא הוקלד לו כלום
const emptyEntry: Entry = { amount: "", type: "deposit" }

// רישום מרוכז (מנהל): ליד כל חבר שדה סכום ובחירת הפקדה או משיכה, ושמירה אחת
function BulkTransactions({ groupId, members }: BulkTransactionsProps) {
  // המטמון
  const queryClient = useQueryClient()
  // מה שהוקלד לכל חבר, לפי userId
  const [entries, setEntries] = useState<Record<number, Entry>>({})
  // קטגוריה אחת לכל הפעולות
  const [category, setCategory] = useState<TransactionCategory>("general")
  // הערה אחת לכל הפעולות
  const [note, setNote] = useState("")
  // הודעת שגיאה של הבדיקה בטופס
  const [errorMessage, setErrorMessage] = useState("")
  // הודעת ההצלחה
  const [successMessage, setSuccessMessage] = useState("")

  // השליחה לשרת
  const bulkMutation = useMutation({
    // השרת מקבל סוג אחד לכל בקשת bulk, ולכן שולחים בקשה אחת להפקדות ובקשה אחת למשיכות (רק אם יש בהן פריטים)
    mutationFn: async (items: BulkItem[]) => {
      // עוברים על שני הסוגים
      for (const type of ["deposit", "withdraw"] as const) {
        // הפריטים מהסוג הזה, בלי השדה type (הוא נשלח פעם אחת ברמה העליונה)
        const itemsOfType = items
          // רק הסוג הנוכחי
          .filter((item) => item.type === type)
          // רק userId ו-amount
          .map(({ userId, amount }) => ({ userId, amount }))
        // יש פריטים: שולחים, ומחכים לתשובה לפני הסוג הבא
        if (itemsOfType.length > 0) {
          // הבקשה, עם הקטגוריה וההערה המשותפות
          await createBulkTransactions({ groupId, input: { type, category, note: note.trim(), items: itemsOfType } })
        }
      }
    },
    // הצלחה: הודעה וניקוי
    onSuccess: (_data, items) => {
      // ההודעה עם מספר הפעולות
      setSuccessMessage(`נשמרו ${items.length} פעולות בהצלחה.`)
      // מנקים את הסכומים
      setEntries({})
      // מנקים את ההערה
      setNote("")
    },
    // שגיאה: ההודעה מהשרת
    onError: (error) => setErrorMessage(getErrorMessage(error)),
    // אחרי הצלחה או שגיאה: מרעננים, כי אם ההפקדות נשמרו והמשיכות נכשלו – היתרות כבר השתנו
    onSettled: () => refreshAfterMoneyChange(queryClient, groupId)
  })

  // עדכון השורה של חבר אחד. שאר החברים נשארים ללא שינוי
  const changeEntry = (userId: number, change: Partial<Entry>) => {
    // מעדכנים לפי הערך הקודם
    setEntries((current) => ({
      // כל השורות הקיימות
      ...current,
      // השורה של החבר: הערך הקודם (או ריק), ומעליו השינוי
      [userId]: { ...(current[userId] ?? emptyEntry), ...change }
    }))
  }

  // שליחת הטופס
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // מונע מהדפדפן לרענן את העמוד
    event.preventDefault()
    // מנקים הודעות קודמות
    setErrorMessage("")
    // מנקים הודעות קודמות
    setSuccessMessage("")

    // האם נמצא סכום לא תקין
    let hasInvalidAmount = false

    // מכינים פריטים רק לחברים שהוזן להם סכום
    const items = members.flatMap((member) => {
      // מה שהוקלד לחבר
      const entry = entries[member.userId]
      // לא הוקלד כלום: מדלגים עליו
      if (!entry || entry.amount.trim() === "") return []
      // ממירים למספר
      const amount = Number(entry.amount)
      // אותם כללים כמו בשרת: מספר, גדול מ-0, עד מיליון ועד שתי ספרות אחרי הנקודה
      if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT || !hasAtMostTwoDecimals(amount)) {
        // מסמנים שיש שגיאה
        hasInvalidAmount = true
        // לא מוסיפים את הפריט
        return []
      }
      // פריט תקין
      return [{ userId: member.userId, amount, type: entry.type }]
    })

    // סכום לא תקין: הודעה ולא שולחים
    if (hasInvalidAmount) {
      // ההודעה
      setErrorMessage("כל סכום חייב להיות גדול מ-0, עד 1,000,000, ועם עד שתי ספרות אחרי הנקודה.")
      // עוצרים
      return
    }

    // לא הוזן אף סכום
    if (items.length === 0) {
      // ההודעה
      setErrorMessage("יש להזין סכום לחבר אחד לפחות.")
      // עוצרים
      return
    }

    // שולחים
    bulkMutation.mutate(items)
  }

  // כמה שורות מולאו, להצגה על כפתור השמירה
  const filledCount = Object.values(entries).filter((entry) => entry.amount.trim() !== "").length

  return (
    // הטופס בכרטיס עם רקע סגלגל עדין. noValidate: הבדיקה שלנו (עם הודעה בעברית) ולא של הדפדפן
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 border-violet-100 bg-violet-50/30">
      {/* הכותרת וההסבר */}
      <div className="flex items-start gap-2">
        {/* סמל בעיגול */}
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700"><Icon name="stack" className="size-4" /></span>
        {/* הטקסט */}
        <div>
          {/* הכותרת */}
          <h2 className="font-bold text-slate-800">רישום מרוכז של הפקדות ומשיכות</h2>
          {/* ההסבר */}
          <p className="text-sm text-slate-500">ממלאים סכום רק לחברים שרוצים לרשום להם פעולה. שורות ריקות לא נשלחות.</p>
        </div>
      </div>

      {/* קטגוריה והערה משותפות */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* הקטגוריה */}
        <FormField label="קטגוריה לכל הפעולות" htmlFor="bulk-category">
          {/* רשימה נפתחת */}
          <select id="bulk-category" className="input" value={category} onChange={(e) => setCategory(e.target.value as TransactionCategory)} disabled={bulkMutation.isPending}>
            {/* אפשרות לכל קטגוריה */}
            <CategoryOptions />
          </select>
        </FormField>
        {/* ההערה: שני שלישים מהרוחב */}
        <FormField label="הערה (לא חובה)" htmlFor="bulk-note" className="sm:col-span-2">
          {/* שדה טקסט, עד 300 תווים */}
          <input id="bulk-note" className="input" maxLength={300} placeholder="למשל: גבייה למסיבת סוף שנה" value={note} onChange={(e) => setNote(e.target.value)} disabled={bulkMutation.isPending} />
        </FormField>
      </div>

      {/* רשימת החברים: שורה לכל חבר. בטלפון השם בשורה אחת והסוג והסכום בשורה שמתחתיה, במסך רחב הכול בשורה אחת */}
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {/* שורה לכל חבר */}
        {members.map((member) => {
          // מה שהוקלד לחבר, או ריק
          const entry = entries[member.userId] ?? emptyEntry
          return (
            // השורה. מודגשת כשהוזן לה סכום. flex-wrap: בטלפון החלקים יורדים שורה
            <li key={member.userId} className={`flex flex-wrap items-center gap-3 px-4 py-3 transition ${entry.amount ? "bg-violet-50/60" : ""}`}>
              {/* השם, ומתחתיו היתרה הנוכחית */}
              <div className="min-w-36 flex-1">
                {/* השם */}
                <p className="font-medium text-slate-800">{member.name}</p>
                {/* היתרה הנוכחית, בצבע לפי הסכום */}
                <p className="text-xs text-slate-500">יתרה: <span className={`font-semibold ${amountClass(member.balance)}`}>{formatMoney(member.balance)}</span></p>
              </div>
              {/* בחירת הסוג: שני כפתורים צמודים */}
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5" role="group" aria-label={`סוג פעולה עבור ${member.name}`}>
                {/* כפתור לכל סוג */}
                {(["deposit", "withdraw"] as const).map((type) => (
                  // הכפתור הנבחר צבוע: ירוק להפקדה, אדום למשיכה
                  <button
                    key={type}
                    type="button"
                    onClick={() => changeEntry(member.userId, { type })}
                    disabled={bulkMutation.isPending}
                    aria-pressed={entry.type === type}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${entry.type === type ? (type === "deposit" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white") : "text-slate-500 hover:bg-slate-100"}`}
                  >
                    {/* הטקסט */}
                    {typeNames[type]}
                  </button>
                ))}
              </div>
              {/* שדה הסכום. aria-label: קורא מסך יודע של מי הסכום */}
              <input
                aria-label={`סכום עבור ${member.name}`}
                type="number"
                step="0.01"
                inputMode="decimal"
                value={entry.amount}
                onChange={(event) => changeEntry(member.userId, { amount: event.target.value })}
                disabled={bulkMutation.isPending}
                placeholder="סכום ₪"
                className="input w-32 py-1.5"
              />
            </li>
          )
        })}
      </ul>

      {/* שגיאה בטופס או מהשרת */}
      {errorMessage && <Alert>{errorMessage}</Alert>}
      {/* הצלחה */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* כפתור השמירה, עם מספר השורות שמולאו */}
      <button type="submit" disabled={bulkMutation.isPending} className="btn-primary">
        {/* הטקסט מתחלף בזמן השליחה */}
        {bulkMutation.isPending ? "שומר..." : `שמירת הפעולות${filledCount ? ` (${filledCount})` : ""}`}
      </button>
    </form>
  )
}

// מייצאים את הקומפוננטה
export default BulkTransactions
