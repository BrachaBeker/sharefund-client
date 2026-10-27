// useState: הודעת השגיאה מהשרת
import { useState } from "react";
// Link: קישור. Navigate: מעבר מיידי. useNavigate: מעבר אחרי הכניסה
import { Link, Navigate, useNavigate } from "react-router-dom";
// useForm: ניהול הטופס והוולידציה
import { useForm } from "react-hook-form";
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors";
// המשתמש המחובר והכניסה
import { useAuth } from "../context/useAuth";
// לאן עוברים אחרי הכניסה
import { getPathAfterLogin } from "../utils/navigation";
// כללי הוולידציה
import { emailRules, passwordRules } from "../utils/validation";
// הטיפוס של פרטי הכניסה
import type { LoginInput } from "../types";
// הקומפוננטות של העמוד
import AuthCard from "../components/ui/AuthCard";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";

// עמוד הכניסה
const Login = () => {
    // המשתמש המחובר (אם יש) ופונקציית הכניסה
    const { user, login } = useAuth()
    // מעבר עמוד
    const navigate = useNavigate()
    // הודעת השגיאה מהשרת (למשל סיסמה שגויה)
    const [error, setError] = useState("")
    // הטופס. isSubmitting: true עד ש-onSubmit מסתיים
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>()

    // אחרי שהוולידציה עברה
    const onSubmit = async (input: LoginInput) => {
        // מנקים שגיאה קודמת
        setError("")
        // try: אם הכניסה נכשלת, מגיעים ל-catch
        try {
            // הכניסה: שומרת טוקן ומשתמש
            const loggedUser = await login(input)
            // מעבר לעמוד המתאים (שינוי סיסמה / אזור אישי / בחירת קבוצה)
            navigate(await getPathAfterLogin(loggedUser), { replace: true })
        } catch (err) {
            // ההודעה מהשרת מתחת לטופס
            setError(getErrorMessage(err))
        }
    }

    // כבר מחובר (ולא באמצע כניסה): אין סיבה להציג את הטופס
    if (user && !isSubmitting) return <Navigate to={user.mustChangePassword ? "/change-password" : "/select-group"} replace />

    return (
        // הכרטיס הממורכז
        <AuthCard title="ברוכים השבים" subtitle="נכנסים עם המייל והסיסמה שקיבלתם">
            {/* הטופס. noValidate: הוולידציה של React Hook Form ולא של הדפדפן */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* המייל */}
                <FormField label="מייל" htmlFor="login-email" error={errors.email?.message}>
                    {/* dir="ltr": המייל נכתב משמאל לימין */}
                    <input id="login-email" type="email" dir="ltr" autoComplete="email" className="input text-left" {...register("email", emailRules)} />
                </FormField>
                {/* הסיסמה */}
                <FormField label="סיסמה" htmlFor="login-password" error={errors.password?.message}>
                    {/* current-password: הדפדפן יכול למלא סיסמה שמורה */}
                    <input id="login-password" type="password" autoComplete="current-password" className="input" {...register("password", passwordRules)} />
                </FormField>
                {/* שגיאה מהשרת */}
                {error && <Alert>{error}</Alert>}
                {/* כפתור הכניסה, ברוחב מלא */}
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                    {/* הטקסט מתחלף בזמן השליחה */}
                    {isSubmitting ? "נכנס..." : "כניסה"}
                </button>
            </form>
            {/* קישור ליצירת קבוצה */}
            <p className="mt-6 text-center text-sm text-slate-500">
                {/* הטקסט */}
                עוד אין לכם קבוצה? <Link to="/create-group" className="font-semibold text-teal-700 hover:underline">פותחים קבוצה חדשה</Link>
            </p>
        </AuthCard>
    )
}

// מייצאים את הקומפוננטה
export default Login
