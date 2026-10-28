import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { getErrorMessage } from "../utils/errors"
import { useAuth } from "../context/useAuth"
import { getPathAfterLogin } from "../utils/navigation"
import { emailRules, passwordRules } from "../utils/validation"
import { demoUsers } from "../utils/demoUsers"
import { gradients } from "../utils/colors"
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
                <div className="grid grid-cols-2 gap-2">
                    {demoUsers.map((demo, index) => (
                        <button
                            key={demo.email}
                            type="button"
                            onClick={() => loginAsDemo(demo)}
                            disabled={isSubmitting}
                            className="group flex cursor-pointer items-center gap-2.5 rounded-2xl border-2 border-slate-100 bg-white p-2.5 text-start transition duration-200 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5"
                        >
                            <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br text-sm font-bold text-white transition duration-300 group-hover:-rotate-6 ${gradients[index % gradients.length]}`}>
                                {index === 0 ? "מ" : index}
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-ink">{demo.label}</span>
                                <span className="block truncate text-xs text-slate-400" dir="ltr">{demo.email}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
                עוד אין לכם קבוצה? <Link to="/create-group" className="link">פותחים קבוצה חדשה</Link>
            </p>
        </AuthCard>
    )
}

export default Login
