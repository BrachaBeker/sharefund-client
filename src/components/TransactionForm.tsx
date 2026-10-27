// useState: איזה טופס פתוח והאם המשיכה אישית
import { useState } from "react"
// useForm: ניהול הטופס והוולידציה. useWatch: מעקב אחרי ערך של שדה בזמן ההקלדה
import { useForm, useWatch } from "react-hook-form"
// useMutation: שליחה לשרת. useQueryClient: רענון הנתונים אחרי ההצלחה
import { useMutation, useQueryClient } from "@tanstack/react-query"
// הקריאה לשרת
import { createTransaction } from "../services/api"
// רענון כל הנתונים שהשתנו אחרי פעולה כספית
import { refreshAfterMoneyChange } from "../services/queryKeys"
// הטיפוסים
import type { CreateTransactionInput, TransactionType } from "../types"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// שמות הסוגים בעברית
import { typeNames } from "../utils/labels"
// כללי הוולידציה
import { amountRules, noteRules } from "../utils/validation"
// שדה בטופס, אפשרויות הקטגוריה, הודעה וסמלים
import FormField from "./ui/FormField"
import CategoryOptions from "./ui/CategoryOptions"
import Alert from "./ui/Alert"
import Icon from "./ui/Icon"

// הפקדה או משיכה של המשתמש המחובר (באזור האישי)
const TransactionForm = ({ groupId }: { groupId: number }) => {
    // הטופס הפתוח: הפקדה, משיכה, או null כשסגור
    const [typeForm, setTypeForm] = useState<TransactionType | null>(null)
    // האם המשיכה אישית (החזר כסף) ולא הוצאה משותפת
    const [isPersonal, setIsPersonal] = useState(false)
    // הטופס. ערכי ברירת המחדל: קטגוריה כללית והערה ריקה
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CreateTransactionInput>({
        // הערכים ההתחלתיים
        defaultValues: { category: "general", note: "" }
    })
    // גישה למטמון, לרענון אחרי ההצלחה
    const queryClient = useQueryClient()

    // הסכום שהוקלד, כדי להציג את כפתור האישור רק אחרי שהוזן סכום
    const amount = useWatch({ control, name: "amount" })

    // סגירת הטופס וניקוי שלו
    const close = () => {
        // מנקים את השדות
        reset()
        // מנקים את השגיאה של השליחה הקודמת
        mutation.reset()
        // מבטלים את הסימון של משיכה אישית
        setIsPersonal(false)
        // סוגרים את הטופס
        setTypeForm(null)
    }

    // השליחה לשרת
    const mutation = useMutation({
        // הפונקציה ששולחת את הבקשה
        mutationFn: createTransaction,
        // הצלחה: היתרות השתנו, ולכן מרעננים את כל מה שמציג אותן
        onSuccess: () => {
            // הקופה, ההיסטוריה, טבלת החברים והקבוצות שלי
            refreshAfterMoneyChange(queryClient, groupId)
            // סוגרים את הטופס
            close()
        }
    })

    // אחרי שהוולידציה עברה. isShared: רק במשיכה שלא סומנה כאישית
    const onSubmit = (input: CreateTransactionInput) =>
        // שולחים את הנתונים עם הסוג ועם isShared
        mutation.mutate({ groupId, input: { ...input, type: typeForm!, isShared: typeForm === "withdraw" && !isPersonal } })

    // פתיחת טופס מסוג מסוים (או החלפה בין הפקדה למשיכה)
    const open = (type: TransactionType) => {
        // מנקים שגיאה קודמת
        mutation.reset()
        // פותחים את הטופס
        setTypeForm(type)
    }

    return (
        // הכרטיס
        <section className="card">
            {/* הכותרת */}
            <h2 className="mb-4 text-base font-bold text-slate-700">פעולה בקופה</h2>
            {/* שני הכפתורים הגדולים: הפקדה ומשיכה */}
            <div className="grid grid-cols-2 gap-3">
                {/* הפקדה: ירוק. מודגש כשהטופס שלו פתוח */}
                <button
                    type="button"
                    onClick={() => open("deposit")}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 font-bold transition ${typeForm === "deposit" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"}`}
                >
                    {/* העיגול עם החץ */}
                    <span className="grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Icon name="arrowDown" /></span>
                    {/* הטקסט */}
                    הפקדה
                </button>
                {/* משיכה: אדום. מודגש כשהטופס שלו פתוח */}
                <button
                    type="button"
                    onClick={() => open("withdraw")}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 font-bold transition ${typeForm === "withdraw" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50"}`}
                >
                    {/* העיגול עם החץ */}
                    <span className="grid size-11 place-items-center rounded-full bg-rose-100 text-rose-600"><Icon name="arrowUp" /></span>
                    {/* הטקסט */}
                    משיכה
                </button>
            </div>

            {/* הטופס: רק אחרי שבחרו הפקדה או משיכה */}
            {typeForm && (
                // הטופס, עם קו מפריד למעלה. noValidate: הוולידציה של React Hook Form (עם הודעות בעברית) ולא של הדפדפן
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                    {/* כותרת הטופס */}
                    <h3 className="font-bold text-slate-800">{typeNames[typeForm]} חדשה</h3>

                    {/* סכום וקטגוריה: זה לצד זה */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* הסכום */}
                        <FormField label="סכום (₪)" htmlFor="tx-amount" error={errors.amount?.message}>
                            {/* inputMode="decimal": בטלפון נפתחת מקלדת מספרים עם נקודה */}
                            <input id="tx-amount" type="number" step="0.01" inputMode="decimal" placeholder="0.00" className="input text-lg font-semibold" autoFocus {...register("amount", amountRules)} />
                        </FormField>
                        {/* הקטגוריה */}
                        <FormField label="קטגוריה" htmlFor="tx-category">
                            {/* רשימה נפתחת של הקטגוריות */}
                            <select id="tx-category" className="input" {...register("category")}>
                                {/* אפשרות לכל קטגוריה */}
                                <CategoryOptions />
                            </select>
                        </FormField>
                    </div>

                    {/* ההערה */}
                    <FormField label="הערה (לא חובה)" htmlFor="tx-note" error={errors.note?.message}>
                        {/* תיבת טקסט של שתי שורות */}
                        <textarea id="tx-note" rows={2} placeholder="למשל: קניית כיבוד למפגש" className="input resize-none" {...register("note", noteRules)} />
                    </FormField>

                    {/* משיכה בלבד: הבחירה בין משיכה משותפת לאישית */}
                    {typeForm === "withdraw" && (
                        // משיכה אישית מודגשת במסגרת צהובה, כדי שלא יבלבלו אותה עם הוצאה משותפת
                        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${isPersonal ? "border-amber-400 bg-amber-50" : "border-amber-200 bg-amber-50/40 hover:border-amber-300"}`}>
                            {/* תיבת הסימון */}
                            <input type="checkbox" checked={isPersonal} onChange={(e) => setIsPersonal(e.target.checked)} className="mt-1 size-4 accent-amber-500" />
                            {/* ההסבר */}
                            <span>
                                {/* השורה הראשית */}
                                <strong className="block text-sm text-amber-900">משיכה אישית: החזר כסף אליי</strong>
                                {/* הסבר מורחב */}
                                <span className="text-xs text-amber-800">
                                    {/* הטקסט משתנה לפי הסימון */}
                                    {isPersonal
                                        ? "הכסף יורד רק מהיתרה שלך. מתאים למשל לפני יציאה מהקבוצה."
                                        : "בלי סימון, המשיכה היא הוצאה משותפת של הקבוצה, ומתחלקת שווה בין כל החברים."}
                                </span>
                            </span>
                        </label>
                    )}

                    {/* שגיאה מהשרת */}
                    {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}

                    {/* הכפתורים */}
                    <div className="flex flex-row-reverse gap-2">
                        {/* אישור: מופיע רק אחרי שהוזן סכום, ומושבת בזמן השליחה */}
                        {!!amount && (
                            // ירוק בהפקדה, אדום במשיכה
                            <button type="submit" disabled={mutation.isPending} className={typeForm === "deposit" ? "btn-primary" : "btn-danger"}>
                                {/* הטקסט מתחלף בזמן השליחה */}
                                {mutation.isPending ? "שולח..." : `אישור ${typeNames[typeForm]}`}
                            </button>
                        )}
                        {/* ביטול */}
                        <button type="button" onClick={close} className="btn-secondary">ביטול</button>
                    </div>
                </form>
            )}
        </section>
    )
}

// מייצאים את הקומפוננטה
export default TransactionForm
