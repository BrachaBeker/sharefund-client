// useForm: הטופס. useFieldArray: רשימת חברים שאפשר להוסיף לה ולהוריד ממנה שורות
import { useFieldArray, useForm } from "react-hook-form"
// useMutation: שליחה לשרת. useQueryClient: רענון "הקבוצות שלי"
import { useMutation, useQueryClient } from "@tanstack/react-query"
// Link: קישור לכניסה. Navigate: מעבר עמוד מיידי. useNavigate: מעבר אחרי ההצלחה
import { Link, Navigate, useNavigate } from "react-router-dom"
// המשתמש המחובר
import { useAuth } from "../context/useAuth"
// הקריאה לשרת
import { createGroup } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הטיפוסים
import type { CreateGroupInput, NewMemberInput } from "../types"
// השגיאה מהשרת (עם הקוד) וההודעה שלה
import { getApiError, getErrorMessage } from "../utils/errors"
// כללי הוולידציה המשותפים
import { emailRules, groupNameRules, nameRules, newPasswordRules } from "../utils/validation"
// הקומפוננטות של העמוד
import MemberFields from "../components/MemberFields"
import FormField from "../components/ui/FormField"
import PageHeader from "../components/ui/PageHeader"
import Alert from "../components/ui/Alert"
import Icon from "../components/ui/Icon"
import { LoadingState } from "../components/ui/PageState"

// מה יש בטופס
interface CreateGroupForm {
  // שם הקבוצה
  groupName: string,
  // פרטי המנהל (רק לאורח)
  manager: NewMemberInput,
  // רשימת החברים, חוץ מהמנהל
  members: NewMemberInput[]
}

// חבר ריק, לשורה חדשה
const emptyMember: NewMemberInput = { name: "", email: "", password: "" }
// מינימום חברים חוץ מהמנהל (כמו בשרת: יחד עם המנהל לפחות 3)
const MIN_MEMBERS = 2

// משווים מיילים בלי הבדל בין אותיות גדולות לקטנות ובלי רווחים
const normalizeEmail = (email: string) => email.trim().toLowerCase()

// מכין חבר לשליחה: בלי רווחים מיותרים בשם ובמייל (הסיסמה נשלחת כמו שהיא)
const cleanMember = (member: NewMemberInput): NewMemberInput => ({ name: member.name.trim(), email: member.email.trim(), password: member.password })

// הוספת קבוצה חדשה: אורח ממלא גם את פרטי המנהל, מחובר ממלא רק את שם הקבוצה והחברים
function CreateGroup() {
  // המשתמש המחובר (אם יש), מצב הבדיקה, וכניסה עם טוקן
  const { user, isLoading: isAuthLoading, loginWithToken } = useAuth()
  // אורח = אין משתמש מחובר
  const isGuest = !user
  // מעבר עמוד
  const navigate = useNavigate()
  // המטמון
  const queryClient = useQueryClient()

  // הטופס, עם שתי שורות חברים ריקות בהתחלה
  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateGroupForm>({
    // הערכים ההתחלתיים
    defaultValues: { groupName: "", manager: emptyMember, members: [emptyMember, emptyMember] }
  })
  // רשימת החברים: fields לתצוגה, append להוספה, remove להסרה
  const { fields, append, remove } = useFieldArray({
    // החיבור לטופס
    control,
    // השדה של הרשימה
    name: "members",
    // כלל על כל הרשימה: לפחות 2 חברים
    rules: { minLength: { value: MIN_MEMBERS, message: `צריך לפחות ${MIN_MEMBERS} חברים חוץ מהמנהל` } }
  })

  // השליחה לשרת
  const mutation = useMutation({
    // הפונקציה ששולחת את הבקשה
    mutationFn: createGroup,
    // הצלחה
    onSuccess: async (result) => {
      // אורח מקבל טוקן: שומרים אותו, והמשתמש מחובר
      if (result.token) await loginWithToken(result.token)
      // רשימת הקבוצות השתנתה
      queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
      // חברים שהמייל שלהם כבר היה רשום: השם והסיסמה שהוקלדו לא נשמרו
      const existing = result.members.filter((member) => !member.isNewUser).map((member) => member.name)
      // ההודעה שתוצג באזור האישי
      const notice = existing.length
        ? `הקבוצה נוצרה! שימו לב: ${existing.join(", ")} כבר היו רשומים באתר, ולכן הם נכנסים עם הסיסמה הקיימת שלהם ולא עם הסיסמה שהוקלדה.`
        : "הקבוצה נוצרה! מסרו לכל חבר את המייל ואת הסיסמה הזמנית שלו. בכניסה הראשונה הם יתבקשו להחליף אותה."
      // מעבר לאזור האישי של הקבוצה החדשה, עם ההודעה
      navigate(`/group/${result.group.id}/dashboard`, { replace: true, state: { notice } })
    },
  })

  // אחרי שהוולידציה עברה: בונים את הבקשה. manager נשלח רק מאורח
  const onSubmit = (form: CreateGroupForm) => {
    // הבקשה
    const input: CreateGroupInput = {
      // שם הקבוצה בלי רווחים מיותרים
      groupName: form.groupName.trim(),
      // החברים
      members: form.members.map(cleanMember),
      // המנהל: רק לאורח. מחובר הוא המנהל בעצמו
      ...(isGuest ? { manager: cleanMember(form.manager) } : {}),
    }
    // שולחים
    mutation.mutate(input)
  }

  // הקוד של השגיאה מהשרת (אם יש), כדי להציג קישור לכניסה
  const errorCode = getApiError(mutation.error)?.code

  // עדיין בודקים אם המשתמש מחובר: לא מציגים טופס לא נכון
  if (isAuthLoading) return <LoadingState />
  // משתמש עם סיסמה זמנית: קודם מחליפים סיסמה
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />

  return (
    // רוחב מקסימלי לטופס
    <div className="mx-auto max-w-4xl">
      {/* הכותרת */}
      <PageHeader
        title="קבוצה חדשה"
        subtitle={isGuest ? "נרשמים כמנהל/ת, נותנים שם לקבוצה ומוסיפים את החברים." : `את/ה (${user.name}) תהיה/י המנהל/ת של הקבוצה.`}
      />

      {/* הטופס. noValidate: הוולידציה של React Hook Form, ולא של הדפדפן */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* אורח: פרטי המנהל */}
        {isGuest && (
          // כרטיס
          <section className="card space-y-4">
            {/* כותרת עם מספר שלב */}
            <SectionTitle step={1} title="הפרטים שלך (המנהל/ת)" text="איתם תיכנס/י לאתר. כבר רשום/ה? אפשר" link />
            {/* שלושת השדות של המנהל */}
            <MemberFields
              idPrefix="manager"
              passwordLabel="סיסמה"
              fields={{
                // שם
                name: register("manager.name", nameRules),
                // מייל
                email: register("manager.email", emailRules),
                // סיסמה
                password: register("manager.password", newPasswordRules),
              }}
              errors={errors.manager}
              disabled={mutation.isPending}
            />
          </section>
        )}

        {/* שם הקבוצה */}
        <section className="card space-y-4">
          {/* כותרת עם מספר שלב */}
          <SectionTitle step={isGuest ? 2 : 1} title="שם הקבוצה" />
          {/* השדה */}
          <FormField label="שם הקבוצה" htmlFor="group-name" error={errors.groupName?.message} className="max-w-md">
            {/* placeholder: דוגמה */}
            <input id="group-name" className="input" placeholder="למשל: קופת ועד הכיתה" disabled={mutation.isPending} {...register("groupName", groupNameRules)} />
          </FormField>
        </section>

        {/* רשימת החברים */}
        <section className="card space-y-4">
          {/* כותרת עם מספר שלב, ומונה החברים */}
          <div className="flex items-start justify-between gap-3">
            {/* הכותרת */}
            <SectionTitle step={isGuest ? 3 : 2} title="חברי הקבוצה" text={`לפחות ${MIN_MEMBERS} חברים חוץ ממך. לכל חבר סיסמה זמנית, שהוא יחליף בכניסה הראשונה.`} />
            {/* המונה */}
            <span className="badge shrink-0 bg-teal-100 text-teal-700">{fields.length} חברים</span>
          </div>

          {/* שורה לכל חבר. field.id: מפתח קבוע ש-useFieldArray נותן לכל שורה */}
          <ol className="space-y-3">
            {/* כל השורות */}
            {fields.map((field, index) => (
              // השורה: כותרת קטנה (מספר וכפתור הסרה) ומתחתיה השדות
              <li key={field.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
                {/* הכותרת של השורה */}
                <div className="mb-2 flex items-center justify-between">
                  {/* המספר של החבר */}
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    {/* העיגול עם המספר */}
                    <span className="grid size-6 place-items-center rounded-full bg-white text-xs font-bold text-slate-500 shadow-xs">{index + 1}</span>
                    {/* הטקסט */}
                    חבר {index + 1}
                  </span>
                  {/* הסרת השורה: לא כשנשארה שורה אחת */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1 || mutation.isPending}
                    className="btn-ghost btn-sm text-slate-400 hover:text-rose-600"
                    aria-label={`הסרת חבר ${index + 1}`}
                  >
                    {/* סמל פח */}
                    <Icon name="trash" className="size-4" />
                    {/* הטקסט */}
                    הסרה
                  </button>
                </div>
                {/* השדות */}
                <div>
                  {/* שלושת השדות של החבר */}
                  <MemberFields
                    idPrefix={`member-${index}`}
                    fields={{
                      // שם
                      name: register(`members.${index}.name`, nameRules),
                      // מייל: מעבר לכללים הרגילים – בלי כפילויות ובלי המייל של המנהל
                      email: register(`members.${index}.email`, {
                        // הכללים הרגילים של מייל
                        ...emailRules,
                        // בדיקות נוספות, עם כל ערכי הטופס
                        validate: (value, formValues) => {
                          // המייל של השורה הזאת, אחרי נרמול
                          const email = normalizeEmail(value)
                          // המייל של המנהל: מהטופס לאורח, או של המשתמש המחובר
                          const managerEmail = normalizeEmail(isGuest ? formValues.manager.email : user.email)
                          // זה המייל של המנהל
                          if (email === managerEmail) return "זה המייל של המנהל. המנהל נוסף לקבוצה אוטומטית"
                          // כמה שורות יש עם אותו מייל
                          const sameEmailCount = formValues.members.filter((member) => normalizeEmail(member.email) === email).length
                          // יותר מאחת: כפילות
                          if (sameEmailCount > 1) return "המייל הזה כבר מופיע ברשימה"
                          // הכול תקין
                          return true
                        }
                      }),
                      // סיסמה זמנית
                      password: register(`members.${index}.password`, newPasswordRules),
                    }}
                    errors={errors.members?.[index]}
                    disabled={mutation.isPending}
                  />
                </div>
              </li>
            ))}
          </ol>

          {/* שגיאה על כל הרשימה (פחות מ-2 חברים) */}
          {errors.members?.root?.message && <Alert>{errors.members.root.message}</Alert>}

          {/* הוספת שורה */}
          <button type="button" onClick={() => append(emptyMember)} disabled={mutation.isPending} className="btn-secondary w-full border-dashed">
            {/* סמל פלוס */}
            <Icon name="plus" />
            {/* הטקסט */}
            הוספת חבר
          </button>
        </section>

        {/* שגיאה מהשרת */}
        {mutation.isError && (
          // הודעת שגיאה
          <Alert>
            {/* ההודעה מהשרת */}
            {getErrorMessage(mutation.error)}
            {/* המייל של המנהל כבר רשום: קישור לכניסה */}
            {errorCode === "EMAIL_EXISTS_LOGIN_REQUIRED" && (
              // הקישור
              <> <Link to="/login" className="font-bold underline">כניסה לאתר</Link>, ואז יוצרים את הקבוצה מהחשבון הקיים.</>
            )}
          </Alert>
        )}

        {/* כפתור היצירה */}
        <div className="flex justify-end">
          {/* גדול ובולט, מושבת בזמן השליחה */}
          <button type="submit" disabled={mutation.isPending} className="btn-primary px-8 py-3 text-base">
            {/* הטקסט מתחלף בזמן השליחה */}
            {mutation.isPending ? "יוצר קבוצה..." : "יצירת הקבוצה"}
          </button>
        </div>
      </form>
    </div>
  )
}

// מה כותרת של חלק בטופס מקבלת
interface SectionTitleProps {
  // מספר השלב
  step: number,
  // הכותרת
  title: string,
  // הסבר (לא חובה)
  text?: string,
  // true: מוסיף בסוף ההסבר קישור לכניסה
  link?: boolean
}

// כותרת של חלק בטופס: עיגול עם מספר, כותרת והסבר
const SectionTitle = ({ step, title, text, link }: SectionTitleProps) => (
  // זה לצד זה
  <div className="flex items-start gap-3">
    {/* העיגול עם המספר */}
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-600 text-sm font-bold text-white">{step}</span>
    {/* הכותרת וההסבר */}
    <div>
      {/* הכותרת */}
      <h2 className="font-bold text-slate-800">{title}</h2>
      {/* ההסבר, ואם צריך – קישור לכניסה */}
      {text && <p className="text-sm text-slate-500">{text}{link && <> <Link to="/login" className="font-semibold text-teal-700 hover:underline">להתחבר</Link>.</>}</p>}
    </div>
  </div>
)

// מייצאים את הקומפוננטה
export default CreateGroup
