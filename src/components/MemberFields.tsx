// FieldError: שגיאה של שדה. UseFormRegisterReturn: מה ש-register() מחזיר (name, onChange, ref...)
import type { FieldError, UseFormRegisterReturn } from "react-hook-form"
// שדה בטופס עם תווית ושגיאה
import FormField from "./ui/FormField"

// מה הקומפוננטה מקבלת
interface MemberFieldsProps {
  // תחילית ל-id של השדות, כדי שלא יהיו שני שדות עם אותו id באותו עמוד
  idPrefix: string,
  // התוצאה של register לכל שדה. כך אותה קומפוננטה עובדת גם בטופס רגיל וגם ברשימה של useFieldArray
  fields: { name: UseFormRegisterReturn, email: UseFormRegisterReturn, password: UseFormRegisterReturn },
  // השגיאות של שלושת השדות (אם יש)
  errors?: { name?: FieldError, email?: FieldError, password?: FieldError },
  // התווית של שדה הסיסמה. ברירת המחדל: "סיסמה זמנית" (למנהל שנרשם זו הסיסמה שלו)
  passwordLabel?: string,
  // true בזמן שליחה לשרת
  disabled?: boolean
}

// שלושת השדות של אדם: שם, מייל וסיסמה.
// משמשת בהוספת חבר לקבוצה, וביצירת קבוצה (למנהל ולכל אחד מהחברים).
const MemberFields = ({ idPrefix, fields, errors, passwordLabel = "סיסמה זמנית", disabled = false }: MemberFieldsProps) => (
  // בטלפון אחד מתחת לשני, ובמסך רחב שלושה בשורה
  <div className="grid gap-3 sm:grid-cols-3">
    {/* השם */}
    <FormField label="שם" htmlFor={`${idPrefix}-name`} error={errors?.name?.message}>
      {/* autoComplete="off": הדפדפן לא ימלא את השם של המשתמש המחובר */}
      <input id={`${idPrefix}-name`} type="text" autoComplete="off" className="input" disabled={disabled} {...fields.name} />
    </FormField>

    {/* המייל */}
    <FormField label="מייל" htmlFor={`${idPrefix}-email`} error={errors?.email?.message}>
      {/* type="email": בטלפון נפתחת מקלדת עם @. dir="ltr": המייל נכתב משמאל לימין */}
      <input id={`${idPrefix}-email`} type="email" dir="ltr" autoComplete="off" className="input text-left" disabled={disabled} {...fields.email} />
    </FormField>

    {/* הסיסמה */}
    <FormField label={passwordLabel} htmlFor={`${idPrefix}-password`} error={errors?.password?.message}>
      {/* new-password: הדפדפן לא ימלא סיסמה שמורה */}
      <input id={`${idPrefix}-password`} type="password" autoComplete="new-password" className="input" disabled={disabled} {...fields.password} />
    </FormField>
  </div>
)

// מייצאים את הקומפוננטה
export default MemberFields
