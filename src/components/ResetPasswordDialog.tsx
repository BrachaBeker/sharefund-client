// useForm: ניהול הטופס והוולידציה
import { useForm } from "react-hook-form"
// useMutation: שליחה לשרת
import { useMutation } from "@tanstack/react-query"
// הקריאה לשרת
import { resetMemberPassword } from "../services/api"
// הטיפוס של חבר עם כל הפרטים
import type { MemberFull } from "../types"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// כללי סיסמה חדשה (6 עד 72 תווים)
import { newPasswordRules } from "../utils/validation"
// חלון, שדה והודעה
import Modal from "./ui/Modal"
import FormField from "./ui/FormField"
import Alert from "./ui/Alert"

// מה הקומפוננטה מקבלת
interface ResetPasswordDialogProps {
    // מזהה הקבוצה
    groupId: number,
    // החבר שהסיסמה שלו מתאפסת
    member: MemberFull,
    // סגירה. message: הודעת הצלחה להצגה בעמוד (רק אחרי הצלחה)
    onClose: (message?: string) => void
}

// חלון לאיפוס סיסמה של חבר (מנהל). במקום window.prompt, כדי שתהיה ולידציה ושהסיסמה לא תוצג בגלוי
const ResetPasswordDialog = ({ groupId, member, onClose }: ResetPasswordDialogProps) => {
    // הטופס: שדה אחד
    const { register, handleSubmit, formState: { errors } } = useForm<{ newPassword: string }>()

    // השליחה לשרת
    const mutation = useMutation({
        // הפונקציה ששולחת את הבקשה
        mutationFn: resetMemberPassword,
        // הצלחה: סוגרים ומעבירים הודעה לעמוד
        onSuccess: () => onClose(`הסיסמה של ${member.name} אופסה. בכניסה הבאה תתבקש/י להחליף אותה.`),
    })

    // אחרי שהוולידציה עברה: שולחים
    const onSubmit = ({ newPassword }: { newPassword: string }) =>
        // הבקשה עם מזהה הקבוצה, מזהה החבר והסיסמה
        mutation.mutate({ groupId, userId: member.userId, newPassword })

    return (
        // החלון. סגירה בלי הודעה
        <Modal title={`איפוס סיסמה ל${member.name}`} onClose={() => onClose()}>
            {/* הטופס. noValidate: הוולידציה של React Hook Form (עם הודעות בעברית) ולא של הדפדפן */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* הסבר */}
                <p className="text-sm text-slate-600">הזינו סיסמה זמנית חדשה ומסרו אותה לחבר/ה. בכניסה הבאה המערכת תבקש להחליף אותה.</p>
                {/* שדה הסיסמה */}
                <FormField label="סיסמה זמנית חדשה" htmlFor="reset-password" error={errors.newPassword?.message}>
                    {/* autoFocus: הסמן בשדה מיד */}
                    <input id="reset-password" type="password" autoComplete="new-password" className="input" autoFocus {...register("newPassword", newPasswordRules)} />
                </FormField>
                {/* שגיאה מהשרת */}
                {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
                {/* הכפתורים */}
                <div className="flex flex-row-reverse gap-2">
                    {/* איפוס: מושבת בזמן השליחה */}
                    <button type="submit" disabled={mutation.isPending} className="btn-primary">
                        {/* הטקסט מתחלף בזמן השליחה */}
                        {mutation.isPending ? "שומר..." : "איפוס הסיסמה"}
                    </button>
                    {/* ביטול */}
                    <button type="button" onClick={() => onClose()} className="btn-secondary">ביטול</button>
                </div>
            </form>
        </Modal>
    )
}

// מייצאים את הקומפוננטה
export default ResetPasswordDialog
