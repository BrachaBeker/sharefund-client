// useMutation: הסרת חבר. useQueryClient: רענון אחרי ההסרה
import { useMutation, useQueryClient } from "@tanstack/react-query"
// useState: הסינונים, הטפסים הפתוחים וההודעות
import { useState } from "react"
// הקריאה לשרת
import { removeMember } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הטיפוסים
import type { MemberBasic, MemberFull, MembersFilters } from "../types"
// הקבוצה הנוכחית, רשימת החברים, וחיפוש עם השהייה
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { useMembers } from "../hooks/useMembers"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
// עיצוב סכום, תאריך וצבע לפי סכום
import { amountClass, formatDate, formatMoney } from "../utils/format"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// שמות מצבי היתרה בעברית
import { balanceStatusNames } from "../utils/labels"
// הקומפוננטות של העמוד
import AddMemberForm from "../components/AddMemberForm"
import BulkTransactions from "../components/BulkTransactions"
import ConfirmDialog from "../components/ConfirmDialog"
import ResetPasswordDialog from "../components/ResetPasswordDialog"
import PageHeader from "../components/ui/PageHeader"
import Alert from "../components/ui/Alert"
import Icon from "../components/ui/Icon"
import SearchInput from "../components/ui/SearchInput"
import RoleBadge from "../components/ui/RoleBadge"
import { EmptyState, ErrorState, LoadingState } from "../components/ui/PageState"

// עיגול עם האות הראשונה של השם (משמש גם בתצוגת החבר וגם בטבלה של המנהל)
const Avatar = ({ name, role }: { name: string, role: MemberBasic["role"] }) => (
  // סגול למנהל, טורקיז לחבר
  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${role === "manager" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"}`}>
    {/* האות הראשונה */}
    {name.charAt(0)}
  </span>
)

// רשימת החברים: תצוגה מלאה למנהל, ותצוגה מצומצמת לחבר
function Members() {
  // הקבוצה כבר טעונה ב-GroupLayout
  const { groupId, group } = useCurrentGroup()
  // האם המשתמש מנהל
  const isManager = group.role === "manager"
  // המטמון
  const queryClient = useQueryClient()

  // הודעת הצלחה בראש העמוד (אחרי הסרה או איפוס סיסמה)
  const [successMessage, setSuccessMessage] = useState("")
  // מה שהוקלד בשדה החיפוש
  const [searchText, setSearchText] = useState("")
  // סינון לפי מצב היתרה
  const [balanceStatus, setBalanceStatus] = useState<MembersFilters["balanceStatus"]>()
  // איזה טופס פתוח בראש העמוד: הוספה, רישום מרוכז, או אף אחד
  const [openPanel, setOpenPanel] = useState<"add" | "bulk" | null>(null)
  // החבר שמוצג לו חלון אישור ההסרה
  const [memberToRemove, setMemberToRemove] = useState<MemberFull | null>(null)
  // החבר שמוצג לו חלון איפוס הסיסמה
  const [memberToReset, setMemberToReset] = useState<MemberFull | null>(null)

  // החיפוש נשלח לשרת רק אחרי שהפסיקו להקליד
  const debouncedSearch = useDebouncedValue(searchText.trim())
  // הסינונים שנשלחים לשרת. ריק = undefined, כדי שלא יישלח בכתובת
  const filters: MembersFilters = { search: debouncedSearch || undefined, balanceStatus }

  // רשימת החברים: לחבר רגיל בלי סינון (השרת מחזיר לו רק שמות ותפקידים)
  const { data: members, isLoading, isError, error } = useMembers(groupId, isManager ? filters : {})
  // כל החברים בלי סינון, לרישום המרוכז. נטען רק כשהרישום פתוח
  const { data: allMembers } = useMembers(groupId, {}, isManager && openPanel === "bulk")

  // הסרת חבר
  const removeMutation = useMutation({
    // הפונקציה ששולחת את הבקשה
    mutationFn: removeMember,
    // הצלחה
    onSuccess: () => {
      // הודעה עם שם החבר
      setSuccessMessage(`${memberToRemove?.name} הוסר/ה מהקבוצה.`)
      // סוגרים את החלון
      setMemberToRemove(null)
      // מרעננים את הרשימה
      queryClient.invalidateQueries({ queryKey: queryKeys.members(groupId) })
      // מרעננים את מספר החברים
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
    },
  })

  // פתיחת חלון ההסרה. לא חוסמים לפי היתרה בממשק: השרת בודק את הכלל ומחזיר הודעה מתאימה
  const askRemove = (member: MemberFull) => {
    // מנקים שגיאה של הסרה קודמת
    removeMutation.reset()
    // מנקים הודעת הצלחה קודמת
    setSuccessMessage("")
    // פותחים את החלון
    setMemberToRemove(member)
  }

  // סגירת חלון איפוס הסיסמה. אם הגיעה הודעה – האיפוס הצליח
  const closeReset = (message?: string) => {
    // סוגרים את החלון
    setMemberToReset(null)
    // הודעת ההצלחה (אם יש)
    if (message) setSuccessMessage(message)
  }

  // פתיחה או סגירה של טופס בראש העמוד
  const togglePanel = (panel: "add" | "bulk") =>
    // אם הוא כבר פתוח – סוגרים, אחרת פותחים אותו
    setOpenPanel((current) => (current === panel ? null : panel))

  // הכפתורים בכותרת: רק למנהל ורק בקבוצה פעילה
  const headerActions = isManager && group.isActive && (
    // fragment: שני כפתורים
    <>
      {/* הוספת חבר */}
      <button type="button" onClick={() => togglePanel("add")} className={openPanel === "add" ? "btn-secondary" : "btn-primary"}>
        {/* סמל */}
        <Icon name={openPanel === "add" ? "close" : "plus"} />
        {/* הטקסט */}
        {openPanel === "add" ? "סגירת ההוספה" : "הוספת חבר"}
      </button>
      {/* רישום מרוכז */}
      <button type="button" onClick={() => togglePanel("bulk")} className="btn-secondary">
        {/* סמל */}
        <Icon name={openPanel === "bulk" ? "close" : "stack"} />
        {/* הטקסט */}
        {openPanel === "bulk" ? "סגירת הרישום" : "רישום מרוכז"}
      </button>
    </>
  )

  return (
    // fragment: כל חלקי העמוד
    <>
      {/* הכותרת */}
      <PageHeader
        title="חברי הקבוצה"
        subtitle={isManager ? "כל החברים, היתרות והפעולות שלהם" : `${group.membersCount} חברים בקבוצה`}
        actions={headerActions}
      />

      {/* הודעת הצלחה */}
      {successMessage && <Alert variant="success" className="mb-6">{successMessage}</Alert>}

      {/* הטפסים שנפתחים מהכפתורים בכותרת */}
      {openPanel === "add" && <div className="mb-6"><AddMemberForm groupId={groupId} onCancel={() => setOpenPanel(null)} /></div>}
      {/* הרישום המרוכז: אחרי שכל החברים נטענו */}
      {openPanel === "bulk" && (
        // רווח מתחת
        <div className="mb-6">
          {/* טוען או מוכן */}
          {allMembers ? <BulkTransactions groupId={groupId} members={allMembers as MemberFull[]} /> : <LoadingState text="טוען את כל החברים..." />}
        </div>
      )}

      {/* שגיאה בטעינה */}
      {isError && <ErrorState title="לא ניתן לטעון את רשימת החברים" text={getErrorMessage(error)} />}
      {/* טעינה ראשונה */}
      {isLoading && <LoadingState text="טוען חברים..." />}

      {/* חבר רגיל: כרטיסים עם שם ותפקיד בלבד (השרת לא שולח לו מיילים ויתרות) */}
      {members && !isManager && (
        // גריד: עמודה אחת בטלפון, עד שלוש במסך רחב
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* כרטיס לכל חבר. אין userId לחבר רגיל, ולכן המפתח הוא השם והמיקום */}
          {(members as MemberBasic[]).map((member, index) => (
            // הכרטיס
            <li key={`${member.name}-${index}`} className="card flex items-center gap-3 p-4 sm:p-4">
              {/* העיגול */}
              <Avatar name={member.name} role={member.role} />
              {/* השם */}
              <span className="flex-1 font-medium text-slate-800">{member.name}</span>
              {/* התפקיד */}
              <RoleBadge role={member.role} />
            </li>
          ))}
        </ul>
      )}

      {/* מנהל: סינון וטבלה מלאה */}
      {members && isManager && (
        // כרטיס בלי ריווח פנימי, כדי שהטבלה תגיע עד הקצוות
        <section className="card overflow-hidden p-0 sm:p-0">
          {/* שורת הסינון */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            {/* החיפוש: תופס את כל הרוחב שנשאר */}
            <SearchInput value={searchText} onChange={setSearchText} placeholder="חיפוש לפי שם או מייל" className="flex-1" />
            {/* כפתורי סינון היתרה */}
            <div className="flex flex-wrap gap-1.5">
              {/* "הכול" ואחריו כל מצב יתרה */}
              {([undefined, "debt", "zero", "credit"] as const).map((status) => (
                // הכפתור הנבחר צבוע
                <button
                  key={status ?? "all"}
                  type="button"
                  onClick={() => setBalanceStatus(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${balanceStatus === status ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {/* השם בעברית */}
                  {status ? balanceStatusNames[status] : "הכול"}
                </button>
              ))}
            </div>
          </div>

          {/* אין תוצאות לסינון */}
          {members.length === 0 ? (
            // ריווח סביב המצב הריק
            <div className="p-6"><EmptyState title="לא נמצאו חברים" text="נסו לשנות את החיפוש או את הסינון." icon="search" /></div>
          ) : (
            // הטבלה, עם גלילה בתוכה בטלפון
            <div className="table-wrap">
              {/* הטבלה */}
              <table className="table">
                {/* הכותרות */}
                <thead>
                  <tr>
                    <th>חבר</th>
                    {/* מייל: מוסתר בטלפון (שם הוא מופיע מתחת לשם) */}
                    <th className="hidden sm:table-cell">מייל</th>
                    <th>יתרה</th>
                    {/* הצטרפות: רק במסך רחב */}
                    <th className="hidden md:table-cell">הצטרפות</th>
                    <th><span className="sr-only">פעולות</span></th>
                  </tr>
                </thead>
                {/* השורות */}
                <tbody>
                  {/* שורה לכל חבר */}
                  {(members as MemberFull[]).map((member) => (
                    // המפתח: userId
                    <tr key={member.userId}>
                      {/* העיגול, השם והתפקיד */}
                      <td>
                        {/* זה לצד זה */}
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          {/* העיגול */}
                          <Avatar name={member.name} role={member.role} />
                          {/* השם, ומתחתיו התפקיד */}
                          <div>
                            {/* השם */}
                            <p className="font-semibold text-slate-800">{member.name}</p>
                            {/* המייל: רק בטלפון, כי שם עמודת המייל מוסתרת */}
                            <p className="text-xs text-slate-400 sm:hidden" dir="ltr">{member.email}</p>
                            {/* התפקיד */}
                            <RoleBadge role={member.role} />
                          </div>
                        </div>
                      </td>
                      {/* המייל, משמאל לימין ובשורה אחת. מוסתר בטלפון */}
                      <td className="hidden whitespace-nowrap text-slate-500 sm:table-cell" dir="ltr">{member.email}</td>
                      {/* היתרה, בצבע לפי הסכום */}
                      <td className={`font-bold whitespace-nowrap ${amountClass(member.balance)}`}>{formatMoney(member.balance)}</td>
                      {/* תאריך ההצטרפות: רק במסך רחב */}
                      <td className="hidden whitespace-nowrap text-slate-500 md:table-cell">{formatDate(member.joinedAt)}</td>
                      {/* הפעולות: רק לחברים (לא למנהל עצמו) */}
                      <td>
                        {/* רק חבר רגיל */}
                        {member.role === "member" && (
                          // הכפתורים זה לצד זה
                          <div className="flex justify-end gap-1.5">
                            {/* איפוס סיסמה */}
                            <button type="button" onClick={() => { setSuccessMessage(""); setMemberToReset(member) }} className="btn-secondary btn-sm" title="איפוס סיסמה">
                              {/* סמל מפתח */}
                              <Icon name="key" className="size-4" />
                              {/* הטקסט: מוסתר בטלפון */}
                              <span className="hidden sm:inline">איפוס סיסמה</span>
                            </button>
                            {/* הסרה: רק בקבוצה פעילה */}
                            {group.isActive && (
                              // אדום עדין
                              <button type="button" onClick={() => askRemove(member)} className="btn-secondary btn-sm text-rose-600 hover:bg-rose-50" title="הסרה">
                                {/* סמל פח */}
                                <Icon name="trash" className="size-4" />
                                {/* הטקסט: מוסתר בטלפון */}
                                <span className="hidden sm:inline">הסרה</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* חלון אישור ההסרה */}
      {memberToRemove && (
        // אדום, כי זו פעולה שאי אפשר לבטל
        <ConfirmDialog
          title={`להסיר את ${memberToRemove.name} מהקבוצה?`}
          confirmText="הסרה"
          danger
          onConfirm={() => removeMutation.mutate({ groupId, userId: memberToRemove.userId })}
          onCancel={() => setMemberToRemove(null)}
          isPending={removeMutation.isPending}
        >
          {/* ההסבר */}
          <p>אפשר להסיר רק חבר שהיתרה שלו 0, וכשיישארו בקבוצה לפחות 3 חברים.</p>
          {/* שגיאה מהשרת (למשל BALANCE_NOT_ZERO) מוצגת בתוך החלון */}
          {removeMutation.isError && <Alert className="mt-3">{getErrorMessage(removeMutation.error)}</Alert>}
        </ConfirmDialog>
      )}

      {/* חלון איפוס הסיסמה */}
      {memberToReset && <ResetPasswordDialog groupId={groupId} member={memberToReset} onClose={closeReset} />}
    </>
  )
}

// מייצאים את הקומפוננטה
export default Members
