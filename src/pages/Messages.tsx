// useState: התיבה, ההודעה הפתוחה, הנמענים וההודעות
import { useState } from "react"
// useForm: טופס כתיבת ההודעה. useWatch: מעקב אחרי התוכן בזמן ההקלדה (למונה התווים)
import { useForm, useWatch } from "react-hook-form"
// useQuery: טעינת ההודעות. useMutation: שליחה וסימון כנקראה. useQueryClient: רענון
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// הקריאות לשרת
import { getMessages, markMessageAsRead, sendMessage } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הטיפוסים
import type { MemberFull, Message, MessagesFilters, SendMessageInput } from "../types"
// הקבוצה הנוכחית ורשימת החברים
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { useMembers } from "../hooks/useMembers"
// עיצוב תאריך
import { formatDateTime } from "../utils/format"
// שמות התיבות בעברית
import { boxNames } from "../utils/labels"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// כללי תוכן ההודעה
import { messageRules } from "../utils/validation"
// הקומפוננטות של העמוד
import PageHeader from "../components/ui/PageHeader"
import Alert from "../components/ui/Alert"
import Icon from "../components/ui/Icon"
import { EmptyState, ErrorState, LoadingState } from "../components/ui/PageState"

// התיבה שנבחרה: הכול, התקבלו או נשלחו
type Box = NonNullable<MessagesFilters["box"]>

// הודעות: רשימה מהחדשה לישנה, כתיבה, ובחירת נמענים למנהל
function Messages() {
  // הקבוצה כבר טעונה ב-GroupLayout
  const { groupId, group } = useCurrentGroup()
  // האם המשתמש מנהל
  const isManager = group.role === "manager"
  // המטמון
  const queryClient = useQueryClient()

  // התיבה שנבחרה
  const [box, setBox] = useState<Box>("all")
  // ההודעה שפתוחה (התוכן המלא מוצג), או null
  const [openId, setOpenId] = useState<number | null>(null)

  // ההודעות בתיבה. בתיבה "הכול" זה אותו מפתח כמו של התג ב-Header
  const { data, isLoading, isError, error } = useQuery({
    // המפתח כולל את התיבה
    queryKey: queryKeys.messages(groupId, { box }),
    // הבקשה
    queryFn: () => getMessages({ groupId, filters: { box } }),
  })

  // סימון הודעה כנקראה
  const readMutation = useMutation({
    // הפונקציה ששולחת את הבקשה
    mutationFn: markMessageAsRead,
    // הצלחה: מרעננים את כל ההודעות (גם את התג ב-Header)
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages(groupId) }),
  })

  // לחיצה על הודעה: פותחת או סוגרת אותה. הודעה שקיבלתי ועוד לא נקראה – מסומנת כנקראה
  const toggleMessage = (message: Message) => {
    // אם היא פתוחה – סוגרים, אחרת פותחים
    setOpenId((current) => (current === message.id ? null : message.id))
    // הודעה שקיבלתי ושלא נקראה
    if (message.direction === "received" && message.isRead === false) {
      // שולחים סימון כנקראה
      readMutation.mutate({ groupId, messageId: message.id })
    }
  }

  return (
    // fragment: כל חלקי העמוד
    <>
      {/* הכותרת, עם מספר ההודעות החדשות */}
      <PageHeader
        title="הודעות"
        subtitle={data?.unreadCount ? `יש לך ${data.unreadCount} הודעות שלא נקראו` : isManager ? "תקשורת עם חברי הקבוצה" : `תקשורת עם המנהל/ת (${group.managerName})`}
      />

      {/* שני טורים במסך רחב: כתיבה מימין, הרשימה משמאל */}
      <div className="grid items-start gap-6 lg:grid-cols-5">
        {/* כתיבת הודעה: רק בקבוצה פעילה. בטלפון מתחת לרשימה (order-last), ובמסך רחב בטור הימני */}
        <div className="order-last lg:sticky lg:top-24 lg:order-none lg:col-span-2">
          {/* פעילה: הטופס. סגורה: הודעה שאי אפשר לשלוח */}
          {group.isActive
            ? <ComposeMessage groupId={groupId} isManager={isManager} managerName={group.managerName} />
            : <Alert variant="warning">הקבוצה סגורה, ולכן אי אפשר לשלוח בה הודעות חדשות.</Alert>}
        </div>

        {/* הרשימה */}
        <section className="lg:col-span-3">
          {/* הלשוניות של התיבות */}
          <div className="mb-4 inline-flex rounded-xl bg-slate-200/70 p-1" role="tablist">
            {/* לשונית לכל תיבה */}
            {(Object.keys(boxNames) as Box[]).map((key) => (
              // הלשונית הנבחרת לבנה ובולטת
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={box === key}
                onClick={() => setBox(key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${box === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {/* השם בעברית */}
                {boxNames[key]}
              </button>
            ))}
          </div>

          {/* טעינה */}
          {isLoading && <LoadingState text="טוען הודעות..." />}
          {/* שגיאה */}
          {isError && <ErrorState title="לא ניתן לטעון את ההודעות" text={getErrorMessage(error)} />}
          {/* אין הודעות */}
          {data && data.items.length === 0 && <EmptyState title="עוד אין הודעות" text={box === "sent" ? "הודעות שתשלחו יופיעו כאן." : "הודעות חדשות יופיעו כאן."} icon="mail" />}

          {/* ההודעות. השרת כבר מחזיר אותן מהחדשה לישנה */}
          {data && data.items.length > 0 && (
            // רשימה עם רווח בין ההודעות
            <ul className="space-y-3">
              {/* כרטיס לכל הודעה */}
              {data.items.map((message) => (
                // המפתח: מזהה ההודעה
                <li key={message.id}>
                  {/* הכרטיס */}
                  <MessageCard message={message} isOpen={openId === message.id} onToggle={() => toggleMessage(message)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

// מה כרטיס הודעה מקבל
interface MessageCardProps {
  // ההודעה
  message: Message,
  // האם התוכן המלא מוצג
  isOpen: boolean,
  // לחיצה על הכרטיס
  onToggle: () => void
}

// כרטיס של הודעה אחת
const MessageCard = ({ message, isOpen, onToggle }: MessageCardProps) => {
  // הודעה שקיבלתי ושעוד לא נקראה
  const isNew = message.direction === "received" && message.isRead === false
  // הודעה ששלחתי
  const isSent = message.direction === "sent"

  return (
    // כפתור על כל הכרטיס. הודעה חדשה מודגשת במסגרת ורקע טורקיז
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={`card block w-full p-4 text-start transition hover:shadow-md sm:p-5 ${isNew ? "border-teal-300 bg-teal-50/50" : ""}`}
    >
      {/* שורת הכותרת: מי, מתי, ותגים */}
      <div className="flex items-start gap-3">
        {/* העיגול: חץ לנשלחה, האות הראשונה של השולח להתקבלה */}
        <span className={`grid size-10 shrink-0 place-items-center rounded-full font-bold ${isSent ? "bg-slate-100 text-slate-500" : "bg-teal-100 text-teal-700"}`}>
          {/* נשלחה: סמל שליחה. התקבלה: האות הראשונה */}
          {isSent ? <Icon name="send" className="size-4" /> : message.sender.name.charAt(0)}
        </span>
        {/* הטקסט */}
        <div className="min-w-0 flex-1">
          {/* השורה העליונה: השם והתאריך */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* נשלחה: למי. התקבלה: ממי */}
            <p className={`text-sm ${isNew ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
              {/* הטקסט לפי הכיוון */}
              {isSent ? `אל: ${message.toAll ? "כל הקבוצה" : message.recipients?.map((r) => r.name).join(", ")}` : message.sender.name}
            </p>
            {/* תג "חדש" */}
            {isNew && <span className="badge bg-teal-600 text-white">חדש</span>}
            {/* תג "לכולם" בהודעה שהתקבלה */}
            {!isSent && message.toAll && <span className="badge bg-slate-100 text-slate-500">לכל הקבוצה</span>}
            {/* התאריך: בצד השני */}
            <span className="ms-auto text-xs text-slate-400">{formatDateTime(message.createdAt)}</span>
          </div>
          {/* התוכן: שתי שורות כשסגור, הכול כשפתוח. whitespace-pre-wrap: שורות חדשות נשמרות */}
          <p className={`mt-1.5 text-sm whitespace-pre-wrap text-slate-600 ${isOpen ? "" : "line-clamp-2"}`}>{message.content}</p>

          {/* הודעה ששלחתי ופתוחה: מי כבר קרא */}
          {isSent && isOpen && message.recipients && (
            // רשימת תגים
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
              {/* תג לכל נמען: ירוק עם וי אם קרא, אפור אם לא */}
              {message.recipients.map((recipient) => (
                // המפתח: מזהה הנמען
                <span key={recipient.userId} className={`badge ${recipient.readAt ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`} title={recipient.readAt ? `נקראה ${formatDateTime(recipient.readAt)}` : "עוד לא נקראה"}>
                  {/* וי למי שקרא */}
                  {recipient.readAt && <Icon name="check" className="size-3" />}
                  {/* השם */}
                  {recipient.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// מה טופס הכתיבה מקבל
interface ComposeMessageProps {
  // מזהה הקבוצה
  groupId: number,
  // מנהל בוחר נמענים, חבר שולח תמיד למנהל
  isManager: boolean,
  // שם המנהל, להסבר לחבר
  managerName: string
}

// טופס כתיבת הודעה
const ComposeMessage = ({ groupId, isManager, managerName }: ComposeMessageProps) => {
  // המטמון
  const queryClient = useQueryClient()
  // הטופס: תוכן ההודעה
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<{ content: string }>({ defaultValues: { content: "" } })
  // מנהל: לשלוח לכולם (ברירת המחדל) או לנבחרים
  const [toAll, setToAll] = useState(true)
  // מנהל: מזהי החברים שנבחרו
  const [recipientIds, setRecipientIds] = useState<number[]>([])
  // שגיאה בבחירת הנמענים
  const [recipientsError, setRecipientsError] = useState("")
  // הודעת ההצלחה
  const [successMessage, setSuccessMessage] = useState("")

  // מנהל: רשימת החברים לבחירה (אותו מפתח כמו בעמוד החברים)
  const { data: members } = useMembers(groupId, {}, isManager)
  // החברים שאפשר לשלוח אליהם: כולם חוץ מהמנהל עצמו
  const recipientOptions = ((members ?? []) as MemberFull[]).filter((member) => member.role === "member")
  // כמה תווים הוקלדו
  const length = useWatch({ control, name: "content" }).length

  // השליחה לשרת
  const mutation = useMutation({
    // הפונקציה ששולחת את הבקשה
    mutationFn: sendMessage,
    // הצלחה: מנקים, מודיעים ומרעננים את הרשימה
    onSuccess: () => {
      // מנקים את התוכן
      reset()
      // מנקים את הבחירה
      setRecipientIds([])
      // ההודעה
      setSuccessMessage("ההודעה נשלחה.")
      // מרעננים את כל ההודעות
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(groupId) })
    },
  })

  // סימון או ביטול סימון של חבר
  const toggleRecipient = (userId: number) => {
    // מנקים שגיאה קודמת
    setRecipientsError("")
    // אם הוא ברשימה – מוציאים, אחרת מוסיפים
    setRecipientIds((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId])
  }

  // אחרי שהוולידציה של התוכן עברה
  const onSubmit = ({ content }: { content: string }) => {
    // מנקים הודעות קודמות
    setSuccessMessage("")
    // מנהל ששולח לנבחרים בלי לבחור אף אחד
    if (isManager && !toAll && recipientIds.length === 0) {
      // ההודעה
      setRecipientsError("יש לבחור לפחות חבר אחד, או לשלוח לכל הקבוצה.")
      // עוצרים
      return
    }
    // הבקשה: חבר – רק התוכן. מנהל – לכולם או לנבחרים
    const input: SendMessageInput = !isManager
      ? { content: content.trim() }
      : toAll ? { content: content.trim(), toAll: true } : { content: content.trim(), recipientIds }
    // שולחים
    mutation.mutate({ groupId, input })
  }

  return (
    // הטופס בכרטיס. noValidate: הוולידציה של React Hook Form (עם הודעות בעברית) ולא של הדפדפן
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4">
      {/* הכותרת */}
      <div className="flex items-center gap-2">
        {/* סמל בעיגול */}
        <span className="grid size-8 place-items-center rounded-lg bg-teal-100 text-teal-700"><Icon name="pencil" className="size-4" /></span>
        {/* הטקסט */}
        <h2 className="font-bold text-slate-800">הודעה חדשה</h2>
      </div>

      {/* חבר: ההודעה תמיד למנהל */}
      {!isManager && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">ההודעה תישלח למנהל/ת: <strong>{managerName}</strong></p>}

      {/* מנהל: בחירה בין כולם לנבחרים */}
      {isManager && (
        // החלק של הנמענים
        <div className="space-y-3">
          {/* שני כפתורים צמודים */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {/* לכל הקבוצה */}
            <button type="button" onClick={() => { setToAll(true); setRecipientsError("") }} className={`rounded-lg py-1.5 text-sm font-semibold transition ${toAll ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>לכל הקבוצה</button>
            {/* לנבחרים */}
            <button type="button" onClick={() => setToAll(false)} className={`rounded-lg py-1.5 text-sm font-semibold transition ${!toAll ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>לחברים נבחרים</button>
          </div>
          {/* לנבחרים: רשימת החברים עם תיבות סימון */}
          {!toAll && (
            // רשימה עם גלילה אם היא ארוכה
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
              {/* אין חברים (עדיין טוען) */}
              {recipientOptions.length === 0 && <p className="p-2 text-sm text-slate-400">טוען חברים...</p>}
              {/* שורה לכל חבר */}
              {recipientOptions.map((member) => (
                // לחיצה על כל השורה מסמנת
                <label key={member.userId} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  {/* תיבת הסימון */}
                  <input type="checkbox" checked={recipientIds.includes(member.userId)} onChange={() => toggleRecipient(member.userId)} className="size-4 accent-teal-600" />
                  {/* השם */}
                  <span className="text-sm text-slate-700">{member.name}</span>
                </label>
              ))}
            </div>
          )}
          {/* שגיאה בבחירה */}
          {recipientsError && <p className="field-error">{recipientsError}</p>}
        </div>
      )}

      {/* תוכן ההודעה */}
      <div>
        {/* התווית */}
        <label htmlFor="message-content" className="label">תוכן ההודעה</label>
        {/* תיבת הטקסט */}
        <textarea id="message-content" rows={5} maxLength={1000} placeholder="כתבו כאן..." className="input resize-y" {...register("content", messageRules)} />
        {/* מתחת: שגיאה מימין ומונה תווים משמאל */}
        <div className="mt-1 flex justify-between text-xs">
          {/* השגיאה */}
          <span className="font-medium text-rose-600">{errors.content?.message}</span>
          {/* המונה */}
          <span className="text-slate-400">{length}/1000</span>
        </div>
      </div>

      {/* שגיאה מהשרת */}
      {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
      {/* הצלחה */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* כפתור השליחה, ברוחב מלא */}
      <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
        {/* סמל שליחה */}
        <Icon name="send" className="size-4" />
        {/* הטקסט מתחלף בזמן השליחה */}
        {mutation.isPending ? "שולח..." : "שליחה"}
      </button>
    </form>
  )
}

// מייצאים את הקומפוננטה
export default Messages
