import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { resetMemberPassword } from "../services/api"
import type { MemberFull } from "../types"
import { getErrorMessage } from "../utils/errors"
import { newPasswordRules } from "../utils/validation"
import Modal from "./ui/Modal"
import FormField from "./ui/FormField"
import Alert from "./ui/Alert"

interface ResetPasswordDialogProps {
    groupId: number,
    member: MemberFull,
    onClose: (message?: string) => void
}

const ResetPasswordDialog = ({ groupId, member, onClose }: ResetPasswordDialogProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<{ newPassword: string }>()

    const mutation = useMutation({
        mutationFn: resetMemberPassword,
        onSuccess: () => onClose(`הסיסמה של ${member.name} אופסה. בכניסה הבאה תתבקש/י להחליף אותה.`),
    })

    const onSubmit = ({ newPassword }: { newPassword: string }) =>
        mutation.mutate({ groupId, userId: member.userId, newPassword })

    return (
        <Modal title={`איפוס סיסמה ל${member.name}`} onClose={() => onClose()}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <p className="text-sm text-slate-600">הזינו סיסמה זמנית חדשה ומסרו אותה לחבר/ה. בכניסה הבאה המערכת תבקש להחליף אותה.</p>
                <FormField label="סיסמה זמנית חדשה" htmlFor="reset-password" error={errors.newPassword?.message}>
                    <input id="reset-password" type="password" autoComplete="new-password" className="input" autoFocus {...register("newPassword", newPasswordRules)} />
                </FormField>
                {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
                <div className="form-actions">
                    <button type="submit" disabled={mutation.isPending} className="btn-primary">
                        {mutation.isPending ? "שומר..." : "איפוס הסיסמה"}
                    </button>
                    <button type="button" onClick={() => onClose()} className="btn-secondary">ביטול</button>
                </div>
            </form>
        </Modal>
    )
}

export default ResetPasswordDialog
