import type { FieldError, UseFormRegisterReturn } from "react-hook-form"
import FormField from "./ui/FormField"

interface MemberFieldsProps {
    idPrefix: string,
    fields: { name: UseFormRegisterReturn, email: UseFormRegisterReturn, password: UseFormRegisterReturn },
    errors?: { name?: FieldError, email?: FieldError, password?: FieldError },
    passwordLabel?: string,
    disabled?: boolean
}

const MemberFields = ({ idPrefix, fields, errors, passwordLabel = "סיסמה זמנית", disabled = false }: MemberFieldsProps) => (
    <div className="grid gap-3 sm:grid-cols-3">
        <FormField label="שם" htmlFor={`${idPrefix}-name`} error={errors?.name?.message}>
            <input id={`${idPrefix}-name`} type="text" autoComplete="off" className="input" disabled={disabled} {...fields.name} />
        </FormField>

        <FormField label="מייל" htmlFor={`${idPrefix}-email`} error={errors?.email?.message}>
            <input id={`${idPrefix}-email`} type="email" dir="ltr" autoComplete="off" className="input text-left" disabled={disabled} {...fields.email} />
        </FormField>

        <FormField label={passwordLabel} htmlFor={`${idPrefix}-password`} error={errors?.password?.message}>
            <input id={`${idPrefix}-password`} type="password" autoComplete="new-password" className="input" disabled={disabled} {...fields.password} />
        </FormField>
    </div>
)

export default MemberFields
