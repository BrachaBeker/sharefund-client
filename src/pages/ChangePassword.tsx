// useState: הודעת השגיאה מהשרת
import { useState } from "react";
// useNavigate: מעבר אחרי ההצלחה
import { useNavigate } from "react-router-dom";
// useForm: ניהול הטופס והוולידציה
import { useForm } from "react-hook-form";
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors";
// המשתמש המחובר ועדכון שלו
import { useAuth } from "../context/useAuth";
// הקריאה לשרת
import { changePassword } from "../services/api";
// הטיפוס של הבקשה
import type { ChangePasswordInput } from "../types";
// לאן עוברים אחרי ההצלחה
import { getPathAfterLogin } from "../utils/navigation";
// כללי הוולידציה
import { newPasswordRules, passwordRules } from "../utils/validation";
// הקומפוננטות של העמוד
import AuthCard from "../components/ui/AuthCard";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";

// הטופס: שני השדות של הבקשה, ועוד שדה אימות שלא נשלח לשרת
type ChangePasswordForm = ChangePasswordInput & { confirmPassword: string }

// עמוד שינוי הסיסמה (גם החלפה חובה של סיסמה זמנית)
const ChangePassword = () => {
    // המשתמש ועדכון שלו
    const { user, setUser } = useAuth()
    // מעבר עמוד
    const navigate = useNavigate()
    // הודעת השגיאה מהשרת
    const [error, setError] = useState("")
    // הטופס. getValues: קריאת ערך של שדה אחר בוולידציה
    const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<ChangePasswordForm>()

    // אחרי שהוולידציה עברה. confirmPassword לא נשלח
    const onSubmit = async ({ currentPassword, newPassword }: ChangePasswordForm) => {
        // מנקים שגיאה קודמת
        setError("")
        // try: אם השינוי נכשל, מגיעים ל-catch
        try {
            // הבקשה. מחזירה את המשתמש עם mustChangePassword: false
            const updatedUser = await changePassword({ currentPassword, newPassword })
            // מעדכנים את המשתמש: ProtectedRoute כבר לא יחסום
            setUser(updatedUser)
            // ממשיכים כמו אחרי כניסה רגילה
            navigate(await getPathAfterLogin(updatedUser), { replace: true })
        } catch (err) {
            // ההודעה מהשרת (למשל סיסמה נוכחית שגויה)
            setError(getErrorMessage(err))
        }
    }

    // סיסמה זמנית: הסבר מיוחד
    const isForced = user?.mustChangePassword

    return (
        // הכרטיס הממורכז
        <AuthCard title="שינוי סיסמה" subtitle={isForced ? "זו הכניסה הראשונה שלך – בוחרים סיסמה אישית חדשה" : "בוחרים סיסמה חדשה לחשבון"}>
            {/* סיסמה זמנית: הודעת מידע */}
            {isForced && <Alert variant="info" className="mb-4">כדי להמשיך, יש להחליף את הסיסמה הזמנית שקיבלת מהמנהל.</Alert>}
            {/* הטופס */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* הסיסמה הנוכחית */}
                <FormField label={isForced ? "הסיסמה הזמנית" : "סיסמה נוכחית"} htmlFor="current-password" error={errors.currentPassword?.message}>
                    {/* current-password: הדפדפן יכול למלא סיסמה שמורה */}
                    <input id="current-password" type="password" autoComplete="current-password" className="input" {...register("currentPassword", passwordRules)} />
                </FormField>
                {/* הסיסמה החדשה: 6 עד 72 תווים, ושונה מהנוכחית */}
                <FormField label="סיסמה חדשה" htmlFor="new-password" error={errors.newPassword?.message} hint="לפחות 6 תווים">
                    {/* new-password: הדפדפן יכול להציע סיסמה חזקה */}
                    <input id="new-password" type="password" autoComplete="new-password" className="input" {...register("newPassword", {
                        // הכללים המשותפים
                        ...newPasswordRules,
                        // בדיקה נוספת: שונה מהנוכחית
                        validate: (value) => value !== getValues("currentPassword") || "הסיסמה החדשה חייבת להיות שונה מהנוכחית"
                    })} />
                </FormField>
                {/* אימות הסיסמה החדשה */}
                <FormField label="אימות הסיסמה החדשה" htmlFor="confirm-password" error={errors.confirmPassword?.message}>
                    {/* חייב להיות זהה לסיסמה החדשה */}
                    <input id="confirm-password" type="password" autoComplete="new-password" className="input" {...register("confirmPassword", {
                        // חובה
                        required: "יש לאמת את הסיסמה",
                        // זהה לחדשה
                        validate: (value) => value === getValues("newPassword") || "הסיסמאות אינן תואמות"
                    })} />
                </FormField>
                {/* שגיאה מהשרת */}
                {error && <Alert>{error}</Alert>}
                {/* כפתור השמירה, ברוחב מלא */}
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                    {/* הטקסט מתחלף בזמן השליחה */}
                    {isSubmitting ? "שומר..." : "שמירת הסיסמה"}
                </button>
            </form>
        </AuthCard>
    )
}

// מייצאים את הקומפוננטה
export default ChangePassword
