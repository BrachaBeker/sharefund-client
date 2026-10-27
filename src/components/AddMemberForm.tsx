// useState: הודעת ההצלחה
import { useState } from "react"
// useForm: ניהול הטופס והוולידציה
import { useForm } from "react-hook-form"
// useMutation: שליחה לשרת. useQueryClient: רענון הרשימה
import { useMutation, useQueryClient } from "@tanstack/react-query"
// הקריאה לשרת
import { addMember } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הטיפוס של חבר חדש
import type { NewMemberInput } from "../types"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// כללי הוולידציה המשותפים
import { emailRules, nameRules, newPasswordRules } from "../utils/validation"
// שלושת השדות, הודעה וסמלים
import MemberFields from "./MemberFields"
import Alert from "./ui/Alert"
import Icon from "./ui/Icon"

// מה הקומפוננטה מקבלת
interface AddMemberFormProps {
  // מזהה הקבוצה
  groupId: number,
  // סגירת הטופס
  onCancel: () => void
}

// הערכים ההתחלתיים של הטופס: שדות ריקים
const emptyMember: NewMemberInput = { name: "", email: "", password: "" }

// טופס הוספת חבר לקבוצה (מנהל)
function AddMemberForm({ groupId, onCancel }: AddMemberFormProps) {
  // המטמון
  const queryClient = useQueryClient()
  // הטופס עם React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewMemberInput>({ defaultValues: emptyMember })
  // הודעת ההצלחה, שתלויה בתשובת השרת
  const [infoMessage, setInfoMessage] = useState("")

  // השליחה לשרת
  const addMutation = useMutation({
    // הפונקציה ששולחת את הבקשה
    mutationFn: addMember,
    // הצלחה
    onSuccess: (member) => {
      // מרעננים את כל הגרסאות של רשימת החברים בקבוצה הזאת
      queryClient.invalidateQueries({ queryKey: queryKeys.members(groupId) })
      // מספר החברים בקבוצה השתנה
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
      // ההודעה לפי התשובה: משתמש חדש, או משתמש שכבר היה רשום
      setInfoMessage(
        // isNewUser: false – הסיסמה שהוקלדה לא נשמרה
        member.isNewUser
          ? `${member.name} נוסף/ה לקבוצה בהצלחה. הסיסמה הזמנית נשמרה, ויש למסור אותה לחבר/ה.`
          : `${member.name} נוסף/ה לקבוצה. המשתמש כבר היה רשום באתר, ולכן הסיסמה שהוקלדה לא נשמרה – נכנסים עם הסיסמה הקיימת.`
      )
      // מנקים את השדות להוספה הבאה
      reset(emptyMember)
    },
    // שגיאה: מוחקים את הודעת ההצלחה הקודמת
    onError: () => setInfoMessage("")
  })

  // אחרי שהוולידציה עברה: שולחים בלי רווחים מיותרים בשם ובמייל. את הסיסמה לא משנים
  const onSubmit = (input: NewMemberInput) => {
    // מנקים הודעה קודמת
    setInfoMessage("")
    // שולחים
    addMutation.mutate({ groupId, input: { name: input.name.trim(), email: input.email.trim(), password: input.password } })
  }

  return (
    // הטופס בכרטיס עם רקע טורקיז עדין. noValidate: הוולידציה של React Hook Form (עם הודעות בעברית) ולא של הדפדפן
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 border-teal-100 bg-teal-50/30">
      {/* הכותרת */}
      <div className="flex items-center gap-2">
        {/* סמל פלוס בעיגול */}
        <span className="grid size-8 place-items-center rounded-lg bg-teal-100 text-teal-700"><Icon name="plus" className="size-4" /></span>
        {/* הטקסט */}
        <h2 className="font-bold text-slate-800">הוספת חבר חדש</h2>
      </div>

      {/* שלושת השדות, עם הכללים המשותפים */}
      <MemberFields
        idPrefix="add-member"
        fields={{
          // שם
          name: register("name", nameRules),
          // מייל
          email: register("email", emailRules),
          // סיסמה זמנית
          password: register("password", newPasswordRules),
        }}
        errors={errors}
        disabled={addMutation.isPending}
      />

      {/* שגיאה מהשרת (למשל ALREADY_MEMBER) */}
      {addMutation.isError && <Alert>{getErrorMessage(addMutation.error)}</Alert>}
      {/* הודעת ההצלחה */}
      {infoMessage && <Alert variant="success">{infoMessage}</Alert>}

      {/* הכפתורים */}
      <div className="flex flex-row-reverse gap-2">
        {/* הוספה: מושבת בזמן השליחה */}
        <button type="submit" disabled={addMutation.isPending} className="btn-primary">
          {/* הטקסט מתחלף בזמן השליחה */}
          {addMutation.isPending ? "מוסיף..." : "הוספת חבר"}
        </button>
        {/* סגירת הטופס */}
        <button type="button" onClick={onCancel} disabled={addMutation.isPending} className="btn-secondary">סגירה</button>
      </div>
    </form>
  )
}

// מייצאים את הקומפוננטה
export default AddMemberForm
