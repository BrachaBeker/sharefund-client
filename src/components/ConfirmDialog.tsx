// ReactNode: התוכן של החלון (טקסט או רשימה)
import type { ReactNode } from "react"
// המבנה הכללי של חלון קופץ
import Modal from "./ui/Modal"

// מה הקומפוננטה מקבלת
interface ConfirmDialogProps {
    // הכותרת של החלון
    title: string,
    // התוכן: טקסט או רשימה (למשל החברים שהיתרה שלהם אינה 0)
    children: ReactNode,
    // מה קורה בלחיצה על "אישור"
    onConfirm: () => void,
    // מה קורה בלחיצה על "ביטול"
    onCancel: () => void,
    // true בזמן שליחה לשרת, כדי למנוע לחיצה כפולה
    isPending?: boolean,
    // הטקסט של כפתור האישור. ברירת המחדל: "אישור"
    confirmText?: string,
    // true: כפתור האישור אדום (פעולה שאי אפשר לבטל, כמו הסרה או סגירה)
    danger?: boolean
}

// חלון אישור כללי: סגירת קבוצה, יציאה מהקבוצה והסרת חבר
const ConfirmDialog = ({ title, children, onConfirm, onCancel, isPending, confirmText = "אישור", danger = false }: ConfirmDialogProps) => (
    // החלון הכללי. סגירה (איקס או Escape) היא כמו ביטול
    <Modal title={title} onClose={onCancel}>
        {/* התוכן */}
        <div className="text-sm text-slate-600">{children}</div>
        {/* הכפתורים */}
        <div className="mt-6 flex flex-row-reverse gap-2">
            {/* כפתור האישור: אדום או רגיל, ומושבת בזמן השליחה */}
            <button type="button" onClick={onConfirm} disabled={isPending} className={danger ? "btn-danger" : "btn-primary"}>
                {/* בזמן השליחה הטקסט מתחלף */}
                {isPending ? "שולח..." : confirmText}
            </button>
            {/* כפתור הביטול */}
            <button type="button" onClick={onCancel} disabled={isPending} className="btn-secondary">ביטול</button>
        </div>
    </Modal>
)

// מייצאים את הקומפוננטה
export default ConfirmDialog
