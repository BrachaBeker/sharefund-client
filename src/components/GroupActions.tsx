// useMutation: שליחה לשרת. useQueryClient: רענון וטעינה של נתונים
import { useMutation, useQueryClient } from "@tanstack/react-query"
// useState: איזה חלון פתוח
import { useState } from "react"
// useNavigate: מעבר עמוד אחרי יציאה מהקבוצה
import { useNavigate } from "react-router-dom"
// הקריאות לשרת
import { closeGroup, getMembers, leaveGroup } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// MemberFull: הטיפוס של חבר כמו שהמנהל מקבל אותו (עם balance)
import type { MemberFull, Role } from "../types"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// עיצוב סכום וצבע לפי סכום
import { amountClass, formatMoney } from "../utils/format"
// חלון אישור, הודעה וסמלים
import ConfirmDialog from "./ConfirmDialog"
import Alert from "./ui/Alert"
import Icon from "./ui/Icon"

// מה הקומפוננטה מקבלת
interface GroupActionsProps {
    // מזהה הקבוצה
    groupId: number,
    // התפקיד שלי: קובע איזה כפתור מוצג
    role: Role
}

// יציאה מהקבוצה (לחבר) וסגירת הקבוצה (למנהל)
const GroupActions = ({ groupId, role }: GroupActionsProps) => {
    // מעבר עמוד
    const navigate = useNavigate()
    // המטמון
    const queryClient = useQueryClient()
    // הודעת שגיאה מהשרת, מוצגת מתחת לכפתור
    const [errorMessage, setErrorMessage] = useState("")
    // איזה חלון פתוח: יציאה, סגירה, או אף אחד
    const [openDialog, setOpenDialog] = useState<"leave" | "close" | null>(null)
    // החברים שהיתרה שלהם אינה 0. מערך ריק = כולם 0
    const [membersWithBalance, setMembersWithBalance] = useState<MemberFull[]>([])
    // true בזמן שטוענים את היתרות לפני פתיחת חלון הסגירה
    const [isCheckingBalances, setIsCheckingBalances] = useState(false)

    // יציאה מהקבוצה
    const leaveMutation = useMutation({
        // הפונקציה ששולחת את הבקשה
        mutationFn: leaveGroup,
        // הצלחה: רשימת הקבוצות השתנתה, ועוברים לבחירת קבוצה
        onSuccess: () => {
            // מרעננים את "הקבוצות שלי"
            queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
            // מעבר לבחירת קבוצה. replace: אי אפשר לחזור אחורה לקבוצה שיצאתי ממנה
            navigate("/select-group", { replace: true })
        },
        // שגיאה (למשל 409 – היתרה שלי אינה 0): סוגרים את החלון ומציגים את ההודעה
        onError: (err) => {
            // סוגרים את החלון
            setOpenDialog(null)
            // ההודעה מהשרת
            setErrorMessage(getErrorMessage(err))
        }
    })

    // סגירת הקבוצה
    const closeMutation = useMutation({
        // הפונקציה ששולחת את הבקשה
        mutationFn: closeGroup,
        // הצלחה: טוענים מחדש, וכל כפתורי הפעולה נעלמים כי isActive הוא false
        onSuccess: () => {
            // פרטי הקבוצה
            queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
            // הקבוצות שלי (הקבוצה מסומנת "סגורה")
            queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
            // סוגרים את החלון
            setOpenDialog(null)
        },
        // שגיאה: סוגרים את החלון ומציגים את ההודעה
        onError: (err) => {
            // סוגרים את החלון
            setOpenDialog(null)
            // ההודעה מהשרת
            setErrorMessage(getErrorMessage(err))
        }
    })

    // לחיצה על "סגירת הקבוצה": קודם בודקים את היתרות, ואז פותחים חלון אחד שמציג אותן
    const handleClose = async () => {
        // מנקים שגיאה קודמת
        setErrorMessage("")
        // הכפתור מושבת בזמן הבדיקה
        setIsCheckingBalances(true)
        // try: אם הקריאה לשרת נכשלת, מגיעים ל-catch ולא קורסים
        try {
            // מביאים את כל החברים דרך המטמון (אותו מפתח כמו בעמוד החברים). מנהל מקבל balance, ולכן as MemberFull[]
            const members = await queryClient.fetchQuery({
                // המפתח של כל החברים בלי סינון
                queryKey: queryKeys.members(groupId, {}),
                // הבקשה
                queryFn: () => getMembers({ groupId, filters: {} }),
            }) as MemberFull[]
            // משאירים רק את מי שהיתרה שלו אינה 0
            setMembersWithBalance(members.filter((member) => member.balance !== 0))
            // פותחים את החלון
            setOpenDialog("close")
        } catch (err) {
            // שגיאה: מציגים אותה
            setErrorMessage(getErrorMessage(err))
        } finally {
            // בכל מקרה: הבדיקה הסתיימה
            setIsCheckingBalances(false)
        }
    }

    return (
        // כרטיס "אזור רגיש": מסגרת אדמדמה עדינה
        <section className="card border-rose-100">
            {/* כותרת והסבר, ולידם הכפתור */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* הכותרת וההסבר */}
                <div>
                    {/* הכותרת לפי התפקיד */}
                    <h2 className="font-bold text-slate-800">{role === "member" ? "יציאה מהקבוצה" : "סגירת הקבוצה"}</h2>
                    {/* ההסבר לפי התפקיד */}
                    <p className="mt-1 text-sm text-slate-500">
                        {/* חבר: צריך יתרה 0. מנהל: אחרי הסגירה אי אפשר לבצע פעולות */}
                        {role === "member"
                            ? "אפשר לצאת רק כשהיתרה שלך היא 0. אם יש לך יתרה, אפשר קודם לבצע משיכה אישית."
                            : "אחרי הסגירה הקבוצה נשארת לצפייה בלבד, ואי אפשר לבצע בה פעולות."}
                    </p>
                </div>
                {/* הכפתור: חבר רואה רק יציאה, מנהל רואה רק סגירה */}
                {role === "member"
                    ? <button type="button" onClick={() => { setErrorMessage(""); setOpenDialog("leave") }} className="btn-secondary shrink-0 text-rose-600"><Icon name="logout" />יציאה מהקבוצה</button>
                    : <button type="button" onClick={handleClose} disabled={isCheckingBalances} className="btn-secondary shrink-0 text-rose-600"><Icon name="lock" />{isCheckingBalances ? "בודק יתרות..." : "סגירת הקבוצה"}</button>}
            </div>

            {/* שגיאה מהשרת */}
            {errorMessage && <Alert className="mt-4">{errorMessage}</Alert>}

            {/* חלון אישור היציאה */}
            {openDialog === "leave" && (
                // אדום, כי זו פעולה שאי אפשר לבטל
                <ConfirmDialog
                    title="לצאת מהקבוצה?"
                    confirmText="יציאה"
                    danger
                    onConfirm={() => leaveMutation.mutate({ groupId })}
                    onCancel={() => setOpenDialog(null)}
                    isPending={leaveMutation.isPending}
                >
                    {/* ההסבר */}
                    אחרי היציאה לא תוכלו לראות את הקבוצה. כדי לחזור, המנהל יצטרך להוסיף אתכם שוב.
                </ConfirmDialog>
            )}

            {/* חלון אישור הסגירה */}
            {openDialog === "close" && (
                // force: true תמיד, כי המנהל כבר ראה את היתרות ואישר
                <ConfirmDialog
                    title={membersWithBalance.length === 0 ? "לסגור את הקבוצה?" : "יש חברים שהיתרה שלהם אינה 0"}
                    confirmText="סגירת הקבוצה"
                    danger
                    onConfirm={() => closeMutation.mutate({ groupId, force: true })}
                    onCancel={() => setOpenDialog(null)}
                    isPending={closeMutation.isPending}
                >
                    {/* ההסבר */}
                    <p>
                        {/* הטקסט לפי המצב: אין יתרות / יש יתרות */}
                        {membersWithBalance.length === 0
                            ? "כל היתרות מאופסות. אחרי הסגירה אי אפשר לבצע בקבוצה פעולות."
                            : "אפשר לסגור בכל זאת, אבל היתרות האלה יישארו כמו שהן:"}
                    </p>
                    {/* הרשימה מוצגת רק כשיש חברים עם יתרה */}
                    {membersWithBalance.length > 0 && (
                        // רשימה עם קווים מפרידים
                        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                            {/* שורה לכל חבר */}
                            {membersWithBalance.map((member) => (
                                // השם מימין והיתרה משמאל
                                <li key={member.userId} className="flex justify-between px-3 py-2">
                                    {/* השם */}
                                    <span>{member.name}</span>
                                    {/* היתרה, בצבע לפי הסכום */}
                                    <span className={`font-semibold ${amountClass(member.balance)}`}>{formatMoney(member.balance)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </ConfirmDialog>
            )}
        </section>
    )
}

// מייצאים את הקומפוננטה
export default GroupActions
