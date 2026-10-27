// useForm: ניהול הטופס והוולידציה
import { useForm } from "react-hook-form"
// useMutation: שליחה לשרת. useQueryClient: רענון ההיסטוריה
import { useMutation, useQueryClient } from "@tanstack/react-query"
// הקריאה לשרת
import { updateTransaction } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הטיפוסים
import type { Transaction, UpdateTransactionInput } from "../types"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// עיצוב סכום ותאריך
import { formatDateTime, formatMoney } from "../utils/format"
// שמות הסוגים בעברית
import { typeNames } from "../utils/labels"
// כללי ההערה
import { noteRules } from "../utils/validation"
// חלון, שדה, אפשרויות הקטגוריה והודעה
import Modal from "./ui/Modal"
import CategoryOptions from "./ui/CategoryOptions"
import FormField from "./ui/FormField"
import Alert from "./ui/Alert"

// מה הקומפוננטה מקבלת
interface EditTransactionDialogProps {
    // מזהה הקבוצה
    groupId: number,
    // התנועה שעורכים
    transaction: Transaction,
    // סגירת החלון
    onClose: () => void
}

// עריכת תנועה: קטגוריה והערה בלבד (אי אפשר לשנות סכום או סוג)
const EditTransactionDialog = ({ groupId, transaction, onClose }: EditTransactionDialogProps) => {
    // המטמון
    const queryClient = useQueryClient()
    // הטופס, עם הערכים הנוכחיים של התנועה
    const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UpdateTransactionInput>({
        // הערכים ההתחלתיים
        defaultValues: { category: transaction.category, note: transaction.note }
    })

    // השליחה לשרת
    const mutation = useMutation({
        // הפונקציה ששולחת את הבקשה
        mutationFn: updateTransaction,
        // הצלחה: מרעננים את ההיסטוריה וסוגרים
        onSuccess: () => {
            // כל הגרסאות של ההיסטוריה
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions(groupId) })
            // סגירה
            onClose()
        },
    })

    // אחרי שהוולידציה עברה: שולחים את שני השדות
    const onSubmit = (input: UpdateTransactionInput) =>
        // ההערה בלי רווחים מיותרים
        mutation.mutate({ groupId, transactionId: transaction.id, input: { category: input.category, note: input.note?.trim() } })

    return (
        // החלון
        <Modal title="עריכת תנועה" onClose={onClose}>
            {/* פרטי התנועה שלא ניתנים לשינוי */}
            <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {/* הסוג והסכום */}
                <p className="font-semibold text-slate-800">{typeNames[transaction.type]} של {formatMoney(transaction.amount)}</p>
                {/* התאריך */}
                <p className="text-xs">{formatDateTime(transaction.createdAt)}</p>
            </div>
            {/* הטופס. noValidate: הוולידציה של React Hook Form (עם הודעות בעברית) ולא של הדפדפן */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* הקטגוריה */}
                <FormField label="קטגוריה" htmlFor="edit-category">
                    {/* רשימה נפתחת */}
                    <select id="edit-category" className="input" {...register("category")}>
                        {/* אפשרות לכל קטגוריה */}
                        <CategoryOptions />
                    </select>
                </FormField>
                {/* ההערה */}
                <FormField label="הערה" htmlFor="edit-note" error={errors.note?.message}>
                    {/* תיבת טקסט */}
                    <textarea id="edit-note" rows={3} className="input resize-none" {...register("note", noteRules)} />
                </FormField>
                {/* שגיאה מהשרת (למשל NOT_YOUR_TRANSACTION) */}
                {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
                {/* הכפתורים */}
                <div className="flex flex-row-reverse gap-2">
                    {/* שמירה: מושבתת כשלא שינו כלום או בזמן השליחה */}
                    <button type="submit" disabled={!isDirty || mutation.isPending} className="btn-primary">
                        {/* הטקסט מתחלף בזמן השליחה */}
                        {mutation.isPending ? "שומר..." : "שמירה"}
                    </button>
                    {/* ביטול */}
                    <button type="button" onClick={onClose} className="btn-secondary">ביטול</button>
                </div>
            </form>
        </Modal>
    )
}

// מייצאים את הקומפוננטה
export default EditTransactionDialog
