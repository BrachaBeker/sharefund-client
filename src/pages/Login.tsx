import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { getErrorMessage } from "../utils/errors"
import { useAuth } from "../context/useAuth"
import { getPathAfterLogin } from "../utils/navigation"
import { emailRules, passwordRules } from "../utils/validation"
import { demoUsers } from "../utils/demoUsers"
import type { LoginInput } from "../types"
import AuthCard from "../components/ui/AuthCard"
import FormField from "../components/ui/FormField"
import Alert from "../components/ui/Alert"

// עמוד הכניסה
const Login = () => {
    const { user, login } = useAuth()
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState("")
    // true מתחילת הכניסה ועד המעבר לעמוד הבא, כדי שההפניה של משתמש מחובר לא תקדים את המעבר הנכון
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginInput>()

    const onSubmit = async (input: LoginInput) => {
        setErrorMessage("")
        setIsLoggingIn(true)
        try {
            const loggedUser = await login(input)
            navigate(await getPathAfterLogin(loggedUser), { replace: true })
        } catch (err) {
            setIsLoggingIn(false)
            setErrorMessage(getErrorMessage(err))
        }
    }

    // כניסה מהירה: ממלאים את הטופס בפרטי משתמש הדמו ושולחים אותו
    const loginAsDemo = ({ email, password }: LoginInput) => {
        setValue("email", email)
        setValue("password", password)
        handleSubmit(onSubmit)()
    }

    if (user && !isLoggingIn) return <Navigate to={user.mustChangePassword ? "/change-password" : "/select-group"} replace />

    return (
        <AuthCard title="ברוכים השבים" subtitle="נכנסים עם המייל והסיסמה שקיבלתם">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <FormField label="מייל" htmlFor="login-email" error={errors.email?.message}>
                    <input id="login-email" type="email" dir="ltr" autoComplete="email" className="input text-left" {...register("email", emailRules)} />
                </FormField>
                <FormField label="סיסמה" htmlFor="login-password" error={errors.password?.message}>
                    <input id="login-password" type="password" autoComplete="current-password" className="input" {...register("password", passwordRules)} />
                </FormField>
                {errorMessage && <Alert>{errorMessage}</Alert>}
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? "נכנס..." : "כניסה"}
                </button>
            </form>

            <div className="mt-6 border-t border-dashed border-slate-200 pt-5">
                <p className="mb-3 text-sm text-slate-500">כניסה מהירה עם משתמש דמו</p>
                <div className="flex flex-wrap gap-2">
                    {demoUsers.map((demo) => (
                        <button
                            key={demo.email}
                            type="button"
                            onClick={() => loginAsDemo(demo)}
                            disabled={isSubmitting}
                            className="cursor-pointer rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm text-slate-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {demo.label}
                        </button>
                    ))}
                </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
                עוד אין לכם קבוצה? <Link to="/create-group" className="font-medium text-brand-700 hover:underline">פותחים קבוצה חדשה</Link>
            </p>
        </AuthCard>
    )
}

export default Login
