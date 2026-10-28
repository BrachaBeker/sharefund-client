import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addMember } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { NewMemberInput } from "../types"
import { getErrorMessage } from "../utils/errors"
import { emailRules, nameRules, newPasswordRules } from "../utils/validation"
import { emptyMember } from "../utils/members"
import MemberFields from "./MemberFields"
import CardTitle from "./ui/CardTitle"
import Alert from "./ui/Alert"

interface AddMemberFormProps {
    groupId: number,
    onCancel: () => void
}

// טופס הוספת חבר לקבוצה (מנהל)
const AddMemberForm = ({ groupId, onCancel }: AddMemberFormProps) => {
    const queryClient = useQueryClient()
    const { register, handleSubmit, reset, formState: { errors } } = useForm<NewMemberInput>({ defaultValues: emptyMember })
    const [successMessage, setSuccessMessage] = useState("")

    const mutation = useMutation({
        mutationFn: addMember,
        onSuccess: (member) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members(groupId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
            setSuccessMessage(
                member.isNewUser
                    ? `${member.name} נוסף/ה לקבוצה בהצלחה. הסיסמה הזמנית נשמרה, ויש למסור אותה לחבר/ה.`
                    : `${member.name} נוסף/ה לקבוצה. המשתמש כבר היה רשום באתר, ולכן הסיסמה שהוקלדה לא נשמרה – נכנסים עם הסיסמה הקיימת.`
            )
            reset(emptyMember)
        },
    })

    const onSubmit = (input: NewMemberInput) => {
        setSuccessMessage("")
        mutation.mutate({ groupId, input: { name: input.name.trim(), email: input.email.trim(), password: input.password } })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4">
            <CardTitle title="הוספת חבר חדש" subtitle="החבר יקבל סיסמה זמנית ויחליף אותה בכניסה הראשונה" />

            <MemberFields
                idPrefix="add-member"
                fields={{
                    name: register("name", nameRules),
                    email: register("email", emailRules),
                    password: register("password", newPasswordRules),
                }}
                errors={errors}
                disabled={mutation.isPending}
            />

            {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <div className="form-actions">
                <button type="submit" disabled={mutation.isPending} className="btn-primary">
                    {mutation.isPending ? "מוסיף..." : "הוספת חבר"}
                </button>
                <button type="button" onClick={onCancel} disabled={mutation.isPending} className="btn-secondary">סגירה</button>
            </div>
        </form>
    )
}

export default AddMemberForm
