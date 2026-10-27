// ReactNode: השדה עצמו שעובר בתוך הקומפוננטה
import type { ReactNode } from "react"

// מה הקומפוננטה מקבלת
interface FormFieldProps {
    // הטקסט של התווית
    label: string,
    // ה-id של השדה, כדי שלחיצה על התווית תעביר את הסמן לשדה
    htmlFor: string,
    // הודעת השגיאה מ-React Hook Form (אם יש)
    error?: string,
    // טקסט עזר קטן מתחת לשדה (לא חובה)
    hint?: string,
    // השדה: input, select או textarea
    children: ReactNode,
    // מחלקות נוספות מבחוץ (למשל רוחב בגריד)
    className?: string
}

// שדה בטופס: תווית, השדה, ומתחתיו שגיאה או טקסט עזר. משמש בכל הטפסים באתר
const FormField = ({ label, htmlFor, error, hint, children, className = "" }: FormFieldProps) => (
    // עוטפים הכול ב-div אחד
    <div className={className}>
        {/* התווית, מחוברת לשדה לפי htmlFor */}
        <label htmlFor={htmlFor} className="label">{label}</label>
        {/* השדה עצמו */}
        {children}
        {/* יש שגיאה: מציגים אותה באדום. אין שגיאה אבל יש טקסט עזר: מציגים אותו באפור */}
        {error
            ? <p className="field-error">{error}</p>
            : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
)

// מייצאים את הקומפוננטה
export default FormField
