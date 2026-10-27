// useLocation: הודעה שמגיעה מעמוד אחר (למשל אחרי יצירת קבוצה)
import { useLocation } from "react-router-dom"
// הקבוצה הנוכחית מ-GroupLayout
import { useCurrentGroup } from "../hooks/useCurrentGroup"
// הקופה, טופס ההפקדה והמשיכה, ויציאה / סגירה
import FundDisplay from "../components/FundDisplay"
import TransactionForm from "../components/TransactionForm"
import GroupActions from "../components/GroupActions"
// כותרת העמוד, הודעה וסמלים
import PageHeader from "../components/ui/PageHeader"
import Alert from "../components/ui/Alert"
import Icon from "../components/ui/Icon"
// שמות התפקידים בעברית
import { roleNames } from "../utils/labels"
// עיצוב סכום וצבע לפי סכום
import { amountClass, formatMoney } from "../utils/format"

// האזור האישי: הקופה, היתרה שלי, הפקדה ומשיכה
const Dashboard = () => {
  // הקבוצה כבר טעונה ב-GroupLayout
  const { groupId, group } = useCurrentGroup()
  // הודעה שהועברה מעמוד יצירת הקבוצה (אם יש)
  const notice = (useLocation().state as { notice?: string } | null)?.notice

  return (
    // fragment: כמה חלקים בעמוד
    <>
      {/* כותרת: שם הקבוצה, ומתחתיה התפקיד, המנהל ומספר החברים */}
      <PageHeader
        title={group.name}
        subtitle={`${roleNames[group.role]} בקבוצה · מנהל: ${group.managerName} · ${group.membersCount} חברים`}
      />

      {/* הודעה מיצירת הקבוצה */}
      {notice && <Alert variant="info" className="mb-6">{notice}</Alert>}

      {/* קבוצה סגורה: הודעה בולטת שהיא לצפייה בלבד */}
      {!group.isActive && (
        // הודעת אזהרה
        <Alert variant="warning" className="mb-6">
          {/* הטקסט */}
          <strong>הקבוצה סגורה</strong> – אפשר לצפות בנתונים, אבל אי אפשר לבצע פעולות.
        </Alert>
      )}

      {/* שני הכרטיסים העליונים: הקופה מימין והיתרה שלי משמאל. בטלפון אחד מתחת לשני */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* הקופה: שלוש חמישיות מהרוחב במסך רחב */}
        <div className="lg:col-span-3">
          {/* הקופה */}
          <FundDisplay fundBalance={group.fundBalance} totalDeposited={group.totalDeposited} />
        </div>

        {/* היתרה שלי: שתי חמישיות מהרוחב */}
        <section className="card flex flex-col lg:col-span-2">
          {/* הכותרת */}
          <h2 className="mb-4 text-base font-bold text-slate-700">היתרה שלי</h2>
          {/* העיגול עם הסמל, בצבע לפי המצב */}
          <span className={`mb-4 grid size-14 place-items-center rounded-2xl ${group.myBalance > 0 ? "bg-emerald-100 text-emerald-600" : group.myBalance < 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}>
            {/* סמל ארנק */}
            <Icon name="wallet" className="size-7" />
          </span>
          {/* הסכום הגדול, בלי סימן מינוס (המילה "חוב" כבר אומרת את זה) */}
          <p className={`text-4xl font-extrabold tracking-tight ${amountClass(group.myBalance)}`}>{formatMoney(Math.abs(group.myBalance))}</p>
          {/* המשפט: יתרה, חוב, או מאופס */}
          <p className="mt-2 text-sm font-medium text-slate-600">
            {/* יתרה חיובית */}
            {group.myBalance > 0 && `יש לך יתרה בסך ${formatMoney(group.myBalance)}`}
            {/* חוב */}
            {group.myBalance < 0 && `יש לך חוב בסך ${formatMoney(-group.myBalance)}`}
            {/* אפס */}
            {group.myBalance === 0 && "היתרה שלך מאופסת"}
          </p>
          {/* הסבר קטן בתחתית הכרטיס */}
          <p className="mt-auto pt-6 text-xs leading-relaxed text-slate-400">
            היתרה עולה בכל הפקדה שלך, ויורדת במשיכה אישית ובחלק שלך מכל הוצאה משותפת.
          </p>
        </section>
      </div>

      {/* הפקדה, משיכה, יציאה וסגירה רק בקבוצה פעילה. בקבוצה סגורה כל כפתורי הפעולה מוסתרים */}
      {group.isActive && (
        // אחד מתחת לשני, עם רווח
        <div className="mt-6 space-y-6">
          {/* הפקדה ומשיכה */}
          <TransactionForm groupId={groupId} />
          {/* יציאה (חבר) או סגירה (מנהל) */}
          <GroupActions groupId={groupId} role={group.role} />
        </div>
      )}
    </>
  )
}

// מייצאים את הקומפוננטה
export default Dashboard
