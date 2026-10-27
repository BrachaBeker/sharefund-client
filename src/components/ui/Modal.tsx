// useEffect: להאזין למקש Escape. ReactNode: התוכן של החלון
import { useEffect, type ReactNode } from "react"
// הסמלים
import Icon from "./Icon"

// מה הקומפוננטה מקבלת
interface ModalProps {
    // הכותרת של החלון
    title: string,
    // התוכן
    children: ReactNode,
    // מה קורה בסגירה (איקס, Escape או לחיצה על הרקע)
    onClose: () => void
}

// חלון קופץ כללי. משמש את ConfirmDialog ואת חלונות העריכה, כדי לא לכתוב את המבנה שוב בכל חלון
const Modal = ({ title, children, onClose }: ModalProps) => {
    // בזמן שהחלון פתוח: לחיצה על Escape סוגרת אותו
    useEffect(() => {
        // הפונקציה שבודקת איזה מקש נלחץ
        const handleKey = (event: KeyboardEvent) => {
            // רק Escape סוגר
            if (event.key === "Escape") onClose()
        }
        // מתחילים להאזין למקלדת
        window.addEventListener("keydown", handleKey)
        // כשהחלון נסגר: מפסיקים להאזין
        return () => window.removeEventListener("keydown", handleKey)
        // מאזינים מחדש רק אם onClose השתנה
    }, [onClose])

    return (
        // הרקע הכהה על כל המסך. לחיצה עליו סוגרת את החלון
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
            {/* החלון עצמו. stopPropagation: לחיצה בתוך החלון לא מגיעה לרקע ולא סוגרת אותו */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* שורת הכותרת: הכותרת וכפתור איקס */}
                <div className="mb-4 flex items-start justify-between gap-4">
                    {/* הכותרת */}
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    {/* כפתור הסגירה */}
                    <button type="button" onClick={onClose} className="btn-ghost -m-2 p-2" aria-label="סגירה">
                        {/* סמל איקס */}
                        <Icon name="close" />
                    </button>
                </div>
                {/* התוכן */}
                {children}
            </div>
        </div>
    )
}

// מייצאים את הקומפוננטה
export default Modal
