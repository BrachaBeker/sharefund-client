// useQuery: טעינת הקבוצות
import { useQuery } from "@tanstack/react-query";
// Link: קישור לכל קבוצה
import { Link } from "react-router-dom";
// הקריאה לשרת
import { getMyGroups } from "../services/api";
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys";
// המשתמש המחובר (לברכה)
import { useAuth } from "../context/useAuth";
// עיצוב סכום וצבע לפי סכום
import { amountClass, formatMoney } from "../utils/format";
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors";
// הקומפוננטות של העמוד
import PageHeader from "../components/ui/PageHeader";
import Icon from "../components/ui/Icon";
import RoleBadge from "../components/ui/RoleBadge";
import LogoMark from "../components/ui/LogoMark";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/PageState";

// בחירת קבוצה: כרטיס לכל קבוצה עם התפקיד והיתרה שלי
const SelectGroup = () => {
  // המשתמש המחובר
  const { user } = useAuth()
  // הקבוצות שלי (אותו מפתח כמו ב-Header)
  const { data: groups, isLoading, isError, error } = useQuery({ queryKey: queryKeys.myGroups, queryFn: getMyGroups })

  // טעינה
  if (isLoading) return <LoadingState text="טוען את הקבוצות שלך..." />
  // שגיאה
  if (isError) return <ErrorState title="לא ניתן לטעון את הקבוצות" text={getErrorMessage(error)} />

  // הקישור ליצירת קבוצה, משותף למצב הריק ולכותרת
  const createLink = <Link to="/create-group" className="btn-primary"><Icon name="plus" />קבוצה חדשה</Link>

  return (
    // fragment: הכותרת והרשימה
    <>
      {/* הכותרת, עם ברכה אישית */}
      <PageHeader title={`שלום, ${user?.name ?? ""}`} subtitle="בחרו קבוצה כדי להמשיך" actions={createLink} />

      {/* אין קבוצות */}
      {!groups?.length && <EmptyState title="עוד אין לך קבוצות" text="פותחים קבוצה חדשה ומוסיפים אליה חברים, או מבקשים ממנהל של קבוצה להוסיף אתכם." icon="users" action={createLink} />}

      {/* כרטיס לכל קבוצה */}
      {!!groups?.length && (
        // גריד: אחד בטלפון, עד שלושה במסך רחב
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* כל הקבוצות */}
          {groups.map((group) => (
            // המפתח: מזהה הקבוצה
            <li key={group.id}>
              {/* כל הכרטיס הוא קישור. קבוצה סגורה מוצגת באפור */}
              <Link
                to={`/group/${group.id}/dashboard`}
                className={`card group flex h-full flex-col gap-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg ${group.isActive ? "" : "opacity-75 grayscale-[40%]"}`}
              >
                {/* השורה העליונה: הסמל והתגים */}
                <div className="flex items-start justify-between">
                  {/* הסמל: האות הראשונה של הקבוצה */}
                  <LogoMark className="size-12 rounded-2xl text-lg">{group.name.charAt(0)}</LogoMark>
                  {/* התגים */}
                  <div className="flex gap-1.5">
                    {/* סגורה */}
                    {!group.isActive && <span className="badge bg-slate-200 text-slate-600"><Icon name="lock" className="size-3" />סגורה</span>}
                    {/* התפקיד */}
                    <RoleBadge role={group.role} />
                  </div>
                </div>
                {/* שם הקבוצה */}
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-teal-700">{group.name}</h2>
                {/* היתרה שלי, בתחתית הכרטיס */}
                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                  {/* התווית */}
                  <span className="text-xs text-slate-500">היתרה שלי</span>
                  {/* הסכום, בצבע לפי הסכום */}
                  <span className={`text-lg font-extrabold ${amountClass(group.myBalance)}`}>{formatMoney(group.myBalance)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// מייצאים את הקומפוננטה
export default SelectGroup
