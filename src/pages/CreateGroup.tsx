import { useFieldArray, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { createGroup } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { CreateGroupInput, NewMemberInput } from "../types"
import { getApiError, getErrorMessage } from "../utils/errors"
import { emailRules, groupNameRules, nameRules, newPasswordRules } from "../utils/validation"
import { emptyMember } from "../utils/members"
import MemberFields from "../components/MemberFields"
import FormField from "../components/ui/FormField"
import PageHeader from "../components/ui/PageHeader"
import Alert from "../components/ui/Alert"
import { LoadingState } from "../components/ui/PageState"
// עיצוב – לא לוגיקה
import Icon from "../design/Icon"

interface CreateGroupForm {
    groupName: string,
    manager: NewMemberInput,
    members: NewMemberInput[]
}

const MIN_MEMBERS = 2

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const cleanMember = (member: NewMemberInput): NewMemberInput => ({ name: member.name.trim(), email: member.email.trim(), password: member.password })

const CreateGroup = () => {
    const { user, isLoading: isAuthLoading, loginWithToken } = useAuth()
    const isGuest = !user
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { register, control, handleSubmit, formState: { errors } } = useForm<CreateGroupForm>({
        defaultValues: { groupName: "", manager: emptyMember, members: [emptyMember, emptyMember] }
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: "members",
        rules: { minLength: { value: MIN_MEMBERS, message: `צריך לפחות ${MIN_MEMBERS} חברים חוץ מהמנהל` } }
    })

    const mutation = useMutation({
        mutationFn: createGroup,
        onSuccess: async (result) => {
            if (result.token) await loginWithToken(result.token)
            queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
            const existing = result.members.filter((member) => !member.isNewUser).map((member) => member.name)
            const notice = existing.length
                ? `הקבוצה נוצרה! שימו לב: ${existing.join(", ")} כבר היו רשומים באתר, ולכן הם נכנסים עם הסיסמה הקיימת שלהם ולא עם הסיסמה שהוקלדה.`
                : "הקבוצה נוצרה! מסרו לכל חבר את המייל ואת הסיסמה הזמנית שלו. בכניסה הראשונה הם יתבקשו להחליף אותה."
            navigate(`/group/${result.group.id}/dashboard`, { replace: true, state: { notice } })
        },
    })

    const onSubmit = (form: CreateGroupForm) => {
        const input: CreateGroupInput = {
            groupName: form.groupName.trim(),
            members: form.members.map(cleanMember),
            ...(isGuest ? { manager: cleanMember(form.manager) } : {}),
        }
        mutation.mutate(input)
    }

    const errorCode = getApiError(mutation.error)?.code

    if (isAuthLoading) return <LoadingState />
    if (user?.mustChangePassword) return <Navigate to="/change-password" replace />

    return (
        <div className="mx-auto max-w-4xl">
            <PageHeader
                title="קבוצה חדשה"
                subtitle={isGuest ? "נרשמים כמנהל/ת, נותנים שם לקבוצה ומוסיפים את החברים." : `את/ה (${user.name}) תהיה/י המנהל/ת של הקבוצה.`}
            />

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                {isGuest && (
                    <section className="card space-y-4">
                        <SectionTitle step={1} title="הפרטים שלך (המנהל/ת)" text="איתם תיכנס/י לאתר. כבר רשום/ה? אפשר" link />
                        <MemberFields
                            idPrefix="manager"
                            passwordLabel="סיסמה"
                            fields={{
                                name: register("manager.name", nameRules),
                                email: register("manager.email", emailRules),
                                password: register("manager.password", newPasswordRules),
                            }}
                            errors={errors.manager}
                            disabled={mutation.isPending}
                        />
                    </section>
                )}

                <section className="card space-y-4">
                    <SectionTitle step={isGuest ? 2 : 1} title="שם הקבוצה" />
                    <FormField label="שם הקבוצה" htmlFor="group-name" error={errors.groupName?.message} className="max-w-md">
                        <input id="group-name" className="input" placeholder="למשל: קופת ועד הכיתה" disabled={mutation.isPending} {...register("groupName", groupNameRules)} />
                    </FormField>
                </section>

                <section className="card space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <SectionTitle step={isGuest ? 3 : 2} title="חברי הקבוצה" text={`לפחות ${MIN_MEMBERS} חברים חוץ ממך. לכל חבר סיסמה זמנית, שהוא יחליף בכניסה הראשונה.`} />
                        <span className="badge shrink-0 bg-brand-100 text-brand-700">{fields.length} חברים</span>
                    </div>

                    <ol className="space-y-3">
                        {fields.map((field, index) => (
                            <li key={field.id} className="rounded-lg border border-slate-200 p-3 sm:p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                        <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{index + 1}</span>
                                        חבר {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1 || mutation.isPending}
                                        className="btn-ghost btn-sm text-slate-400 hover:text-rose-600"
                                        aria-label={`הסרת חבר ${index + 1}`}
                                    >
                                        <Icon name="trash" className="size-4" />
                                        הסרה
                                    </button>
                                </div>
                                <div>
                                    <MemberFields
                                        idPrefix={`member-${index}`}
                                        fields={{
                                            name: register(`members.${index}.name`, nameRules),
                                            email: register(`members.${index}.email`, {
                                                ...emailRules,
                                                validate: (value, formValues) => {
                                                    const email = normalizeEmail(value)
                                                    const managerEmail = normalizeEmail(isGuest ? formValues.manager.email : user.email)
                                                    if (email === managerEmail) return "זה המייל של המנהל. המנהל נוסף לקבוצה אוטומטית"
                                                    const sameEmailCount = formValues.members.filter((member) => normalizeEmail(member.email) === email).length
                                                    if (sameEmailCount > 1) return "המייל הזה כבר מופיע ברשימה"
                                                    return true
                                                }
                                            }),
                                            password: register(`members.${index}.password`, newPasswordRules),
                                        }}
                                        errors={errors.members?.[index]}
                                        disabled={mutation.isPending}
                                    />
                                </div>
                            </li>
                        ))}
                    </ol>

                    {errors.members?.root?.message && <Alert>{errors.members.root.message}</Alert>}

                    <button type="button" onClick={() => append(emptyMember)} disabled={mutation.isPending} className="btn-secondary w-full border-dashed">
                        <Icon name="plus" className="size-4" />
                        הוספת חבר
                    </button>
                </section>

                {mutation.isError && (
                    <Alert>
                        {getErrorMessage(mutation.error)}
                        {errorCode === "EMAIL_EXISTS_LOGIN_REQUIRED" && (
                            <> <Link to="/login" className="font-bold underline">כניסה לאתר</Link>, ואז יוצרים את הקבוצה מהחשבון הקיים.</>
                        )}
                    </Alert>
                )}

                <div className="flex justify-end">
                    <button type="submit" disabled={mutation.isPending} className="btn-primary px-6">
                        {mutation.isPending ? "יוצר קבוצה..." : "יצירת הקבוצה"}
                    </button>
                </div>
            </form>
        </div>
    )
}

interface SectionTitleProps {
    step: number,
    title: string,
    text?: string,
    link?: boolean
}

const SectionTitle = ({ step, title, text, link }: SectionTitleProps) => (
    <div className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-brand-200">{step}</span>
        <div>
            <h2 className="card-title">{title}</h2>
            {text && <p className="text-sm text-slate-500">{text}{link && <> <Link to="/login" className="link">להתחבר</Link>.</>}</p>}
        </div>
    </div>
)

export default CreateGroup
