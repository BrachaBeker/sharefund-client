import type { ReactNode } from "react"

interface FormFieldProps {
    label: string,
    htmlFor: string,
    error?: string,
    hint?: string,
    children: ReactNode,
    className?: string
}

const FormField = ({ label, htmlFor, error, hint, children, className = "" }: FormFieldProps) => (
    <div className={className}>
        <label htmlFor={htmlFor} className="label">{label}</label>
        {children}
        {error
            ? <p className="field-error">{error}</p>
            : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
)

export default FormField
