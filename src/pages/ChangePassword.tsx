import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { getErrorMessage } from "../utils/errors"
import { useAuth } from "../context/useAuth"
import { changePassword } from "../services/api"
import type { ChangePasswordInput } from "../types"
import { getPathAfterLogin } from "../utils/navigation"
import { newPasswordRules, passwordRules } from "../utils/validation"
import AuthCard from "../components/ui/AuthCard"
import FormField from "../components/ui/FormField"
import Alert from "../components/ui/Alert"

type ChangePasswordForm = ChangePasswordInput & { confirmPassword: string }

const ChangePassword = () => {
    const { user, setUser } = useAuth()
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState("")
    const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<ChangePasswordForm>()

    const onSubmit = async ({ currentPassword, newPassword }: ChangePasswordForm) => {
        setErrorMessage("")
        try {
            const updatedUser = await changePassword({ currentPassword, newPassword })
            setUser(updatedUser)
            navigate(await getPathAfterLogin(updatedUser), { replace: true })
        } catch (err) {
            setErrorMessage(getErrorMessage(err))
        }
    }

    const isForced = user?.mustChangePassword

    return (
        <AuthCard title="שינוי סיסמה" subtitle={isForced ? "זו הכניסה הראשונה שלך – בוחרים סיסמה אישית חדשה" : "בוחרים סיסמה חדשה לחשבון"}>
            {isForced && <Alert variant="info" className="mb-4">כדי להמשיך, יש להחליף את הסיסמה הזמנית שקיבלת מהמנהל.</Alert>}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <FormField label={isForced ? "הסיסמה הזמנית" : "סיסמה נוכחית"} htmlFor="current-password" error={errors.currentPassword?.message}>
                    <input id="current-password" type="password" autoComplete="current-password" className="input" {...register("currentPassword", passwordRules)} />
                </FormField>
                <FormField label="סיסמה חדשה" htmlFor="new-password" error={errors.newPassword?.message} hint="לפחות 6 תווים">
                    <input id="new-password" type="password" autoComplete="new-password" className="input" {...register("newPassword", {
                        ...newPasswordRules,
                        validate: (value) => value !== getValues("currentPassword") || "הסיסמה החדשה חייבת להיות שונה מהנוכחית"
                    })} />
                </FormField>
                <FormField label="אימות הסיסמה החדשה" htmlFor="confirm-password" error={errors.confirmPassword?.message}>
                    <input id="confirm-password" type="password" autoComplete="new-password" className="input" {...register("confirmPassword", {
                        required: "יש לאמת את הסיסמה",
                        validate: (value) => value === getValues("newPassword") || "הסיסמאות אינן תואמות"
                    })} />
                </FormField>
                {errorMessage && <Alert>{errorMessage}</Alert>}
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? "שומר..." : "שמירת הסיסמה"}
                </button>
            </form>
        </AuthCard>
    )
}

export default ChangePassword
