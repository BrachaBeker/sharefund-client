// useForm: ניהול הטופס והוולידציה
import { useForm } from "react-hook-form"
// useMutation: שליחת השינוי לשרת
import { useMutation } from "@tanstack/react-query"
// המשתמש המחובר ועדכון שלו
import { useAuth } from "../context/useAuth"
// הקריאה לשרת
import { updateMe } from "../services/api"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// כללי הוולידציה של שם
import { nameRules } from "../utils/validation"
// חלון קופץ, שדה בטופס והודעה
import Modal from "./ui/Modal"
import FormField from "./ui/FormField"
import Alert from "./ui/Alert"

// חלון לשינוי השם של המשתמש המחובר (נפתח מתפריט המשתמש ב-Header)
const ChangeNameDialog = ({ onClose }: { onClose: () => void }) => {
    // המשתמש ועדכון שלו ב-Context
    const { user, setUser } = useAuth()
    // הטופס, עם השם הנוכחי כערך התחלתי
    const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({ defaultValues: { name: user?.name ?? "" } })

    // השליחה לשרת
    const mutation = useMutation({
        // הפונקציה ששולחת את הבקשה
        mutationFn: updateMe,
        // הצלחה: מעדכנים את המשתמש ב-Context (השם מתעדכן מיד ב-Header) וסוגרים
        onSuccess: (updatedUser) => {
            // השם החדש
            setUser(updatedUser)
            // סגירת החלון
            onClose()
        },
    })

    // אחרי שהוולידציה עברה: שולחים את השם בלי רווחים מיותרים
    const onSubmit = ({ name }: { name: string }) => mutation.mutate({ name: name.trim() })

    return (
        // החלון
        <Modal title="שינוי שם" onClose={onClose}>
            {/* הטופס. noValidate: הוולידציה של React Hook Form (עם הודעות בעברית) ולא של הדפדפן */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* שדה השם */}
                <FormField label="השם שלך" htmlFor="change-name" error={errors.name?.message}>
                    {/* autoFocus: הסמן נמצא בשדה מיד כשהחלון נפתח */}
                    <input id="change-name" className="input" autoFocus {...register("name", nameRules)} />
                </FormField>
                {/* שגיאה מהשרת */}
                {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
                {/* הכפתורים */}
                <div className="flex flex-row-reverse gap-2">
                    {/* שמירה: מושבת בזמן השליחה */}
                    <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                        {/* הטקסט מתחלף בזמן השליחה */}
                        {mutation.isPending ? "שומר..." : "שמירה"}
                    </button>
                    {/* ביטול */}
                    <button type="button" className="btn-secondary" onClick={onClose}>ביטול</button>
                </div>
            </form>
        </Modal>
    )
}

// מייצאים את הקומפוננטה
export default ChangeNameDialog
