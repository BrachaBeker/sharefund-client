import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "../context/useAuth"
import { updateMe } from "../services/api"
import { getErrorMessage } from "../utils/errors"
import { nameRules } from "../utils/validation"
import Modal from "./ui/Modal"
import FormField from "./ui/FormField"
import Alert from "./ui/Alert"

// חלון לשינוי השם של המשתמש המחובר (נפתח מתפריט המשתמש ב-Header)
const ChangeNameDialog = ({ onClose }: { onClose: () => void }) => {
    const { user, setUser } = useAuth()
    const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({ defaultValues: { name: user?.name ?? "" } })

    const mutation = useMutation({
        mutationFn: updateMe,
        onSuccess: (updatedUser) => {
            setUser(updatedUser)
            onClose()
        },
    })

    const onSubmit = ({ name }: { name: string }) => mutation.mutate({ name: name.trim() })

    return (
        <Modal title="שינוי שם" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <FormField label="השם שלך" htmlFor="change-name" error={errors.name?.message}>
                    <input id="change-name" className="input" autoFocus {...register("name", nameRules)} />
                </FormField>
                {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                        {mutation.isPending ? "שומר..." : "שמירה"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onClose}>ביטול</button>
                </div>
            </form>
        </Modal>
    )
}

export default ChangeNameDialog
