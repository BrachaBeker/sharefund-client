// useState: אילו תפריטים פתוחים
import { useState } from "react"
// Link: קישור. NavLink: קישור שיודע אם הוא העמוד הנוכחי. useMatch: האם אנחנו בתוך קבוצה. useNavigate: מעבר עמוד
import { Link, NavLink, useMatch, useNavigate } from "react-router-dom"
// useQuery: טעינת נתונים מהשרת
import { useQuery } from "@tanstack/react-query"
// המשתמש המחובר והתנתקות
import { useAuth } from "../context/useAuth"
// הקריאות לשרת
import { getMessages, getMyGroup, getMyGroups } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// שמות התפקידים בעברית (לתפריט הטלפון)
import { roleNames } from "../utils/labels"
// הסמלים
import Icon, { type IconName } from "./ui/Icon"
// תג התפקיד והריבוע של הלוגו
import RoleBadge from "./ui/RoleBadge"
import LogoMark from "./ui/LogoMark"
// חלון שינוי השם
import ChangeNameDialog from "./ChangeNameDialog"

// הלוגו: ריבוע טורקיז עם ₪ והשם. מוצג בכל המצבים
const Logo = ({ to }: { to: string }) => (
  // קישור: לדף הבית לאורח, ולקבוצות שלי למחובר
  <Link to={to} className="flex shrink-0 items-center gap-2">
    {/* הסמל: ריבוע עם מעבר צבע וסימן שקל */}
    <LogoMark className="size-9 rounded-xl text-lg">₪</LogoMark>
    {/* השם */}
    <span className="text-lg font-extrabold tracking-tight text-slate-900">ShareFund</span>
  </Link>
)

// הכותרת העליונה, בשלושה מצבים: אורח, מחובר בלי קבוצה, ובתוך קבוצה
const Header = () => {
  // המשתמש המחובר והתנתקות
  const { user, logout } = useAuth()
  // מעבר עמוד אחרי התנתקות
  const navigate = useNavigate()
  // התפריט של הטלפון (שלושת הקווים)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // תפריט המשתמש במחשב (לחיצה על השם)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  // חלון שינוי השם
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)

  // האם הכתובת היא של קבוצה (/group/5/...)
  const match = useMatch("/group/:id/*")
  // ה-id מהכתובת כמספר (NaN אם אנחנו לא בתוך קבוצה)
  const groupId = Number(match?.params.id)
  // בתוך קבוצה: יש משתמש מחובר שכבר החליף סיסמה, וה-id תקין
  const isInGroup = !!user && !user.mustChangePassword && Number.isInteger(groupId) && groupId > 0

  // פרטי הקבוצה (שם ותפקיד). אותו מפתח כמו בעמוד, ולכן אין בקשה כפולה
  const { data: group } = useQuery({
    // המפתח של הקבוצה
    queryKey: queryKeys.group(groupId),
    // הבקשה
    queryFn: () => getMyGroup(groupId),
    // רק בתוך קבוצה
    enabled: isInGroup,
  })
  // מציגים את קישורי הקבוצה רק אחרי שהקבוצה נטענה בהצלחה (בכתובת של קבוצה שלא קיימת – לא מציגים)
  const showGroupNav = isInGroup && !!group
  // הקבוצות שלי, כדי לדעת אם להציג "החלפת קבוצה"
  const { data: groups } = useQuery({
    // המפתח של הקבוצות שלי
    queryKey: queryKeys.myGroups,
    // הבקשה
    queryFn: getMyGroups,
    // רק כשהקבוצה נטענה
    enabled: showGroupNav,
  })
  // ההודעות, בשביל התג עם מספר ההודעות שלא נקראו. אותו מפתח כמו בעמוד ההודעות בתיבה "הכול"
  const { data: messages } = useQuery({
    // המפתח של ההודעות בתיבה "הכול"
    queryKey: queryKeys.messages(groupId, { box: "all" }),
    // הבקשה
    queryFn: () => getMessages({ groupId, filters: { box: "all" } }),
    // רק כשהקבוצה נטענה
    enabled: showGroupNav,
    // בודקים הודעות חדשות פעם בדקה
    refetchInterval: 60_000,
  })
  // מספר ההודעות שלא נקראו (0 אם עוד לא נטען)
  const unreadCount = messages?.unreadCount ?? 0

  // סוגר את כל התפריטים (אחרי לחיצה על קישור)
  const closeMenus = () => {
    // סוגר את תפריט הטלפון
    setIsMobileMenuOpen(false)
    // סוגר את תפריט המשתמש
    setIsUserMenuOpen(false)
  }

  // התנתקות: מנקים הכול וחוזרים לדף הבית
  const handleLogout = () => {
    // סוגרים את התפריטים
    closeMenus()
    // מוחקים טוקן, משתמש ומטמון
    logout()
    // לדף הבית
    navigate("/")
  }

  // הקישורים של עמודי הקבוצה. מערך אחד שמשמש גם במחשב וגם בטלפון
  const groupLinks: { to: string, label: string, icon: IconName, badge?: number }[] = [
    // אזור אישי
    { to: `/group/${groupId}/dashboard`, label: "אזור אישי", icon: "wallet" },
    // חברים
    { to: `/group/${groupId}/members`, label: "חברים", icon: "users" },
    // היסטוריה
    { to: `/group/${groupId}/history`, label: "היסטוריה", icon: "clock" },
    // הודעות, עם תג של הודעות שלא נקראו
    { to: `/group/${groupId}/messages`, label: "הודעות", icon: "mail", badge: unreadCount },
  ]

  // מציג את קישורי הקבוצה. vertical: בטלפון הקישורים אחד מתחת לשני
  const renderGroupLinks = (vertical: boolean) => groupLinks.map((link) => (
    // NavLink מעביר isActive, כדי לצבוע את הקישור של העמוד הנוכחי
    <NavLink
      key={link.to}
      to={link.to}
      onClick={closeMenus}
      className={({ isActive }) =>
        // הבסיס, ואז צבע לפי "פעיל או לא"
        `relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${vertical ? "w-full" : ""} ${isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
      }
    >
      {/* הסמל */}
      <Icon name={link.icon} className="size-5" />
      {/* הטקסט */}
      {link.label}
      {/* התג: רק כשיש הודעות שלא נקראו */}
      {!!link.badge && (
        // עיגול אדום עם המספר. aria-label: קורא מסך יגיד "3 הודעות חדשות"
        <span className="grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[11px] leading-5 font-bold text-white" aria-label={`${link.badge} הודעות חדשות`}>
          {/* המספר */}
          {link.badge}
        </span>
      )}
    </NavLink>
  ))

  // פעולות המשתמש (שינוי שם, שינוי סיסמה, התנתקות). משמשות גם בתפריט המשתמש וגם בתפריט הטלפון
  const renderUserActions = () => (
    // fragment: בלי עוטף נוסף
    <>
      {/* החלפת קבוצה: רק בתוך קבוצה ורק למי שיש יותר מקבוצה אחת */}
      {showGroupNav && groups && groups.length > 1 && (
        // קישור לבחירת קבוצה
        <Link to="/select-group" onClick={closeMenus} className="btn-ghost w-full justify-start">
          {/* סמל החלפה */}
          <Icon name="switch" />
          {/* הטקסט */}
          החלפת קבוצה
        </Link>
      )}
      {/* יצירת קבוצה חדשה */}
      <Link to="/create-group" onClick={closeMenus} className="btn-ghost w-full justify-start">
        {/* סמל פלוס */}
        <Icon name="plus" />
        {/* הטקסט */}
        יצירת קבוצה חדשה
      </Link>
      {/* שינוי שם: פותח חלון */}
      <button type="button" onClick={() => { closeMenus(); setIsNameDialogOpen(true) }} className="btn-ghost w-full justify-start">
        {/* סמל עיפרון */}
        <Icon name="pencil" />
        {/* הטקסט */}
        שינוי שם
      </button>
      {/* שינוי סיסמה */}
      <Link to="/change-password" onClick={closeMenus} className="btn-ghost w-full justify-start">
        {/* סמל מפתח */}
        <Icon name="key" />
        {/* הטקסט */}
        שינוי סיסמה
      </Link>
      {/* קו מפריד לפני ההתנתקות */}
      <hr className="my-1 border-slate-100" />
      {/* התנתקות: באדום */}
      <button type="button" onClick={handleLogout} className="btn-ghost w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700">
        {/* סמל יציאה */}
        <Icon name="logout" />
        {/* הטקסט */}
        התנתקות
      </button>
    </>
  )

  return (
    // sticky: הכותרת נשארת למעלה בזמן גלילה. רקע לבן שקוף-למחצה עם טשטוש
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      {/* השורה העליונה */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* צד ימין: הלוגו, ובתוך קבוצה גם שם הקבוצה והתפקיד */}
        <div className="flex min-w-0 items-center gap-3">
          {/* הלוגו */}
          <Logo to={user ? "/select-group" : "/"} />
          {/* שם הקבוצה והתפקיד: במחשב בלבד (בטלפון הם בתפריט) */}
          {showGroupNav && (
            // קו מפריד משמאל ללוגו, ואז השם והתג
            <div className="hidden min-w-0 items-center gap-2 border-s border-slate-200 ps-3 lg:flex">
              {/* שם הקבוצה. truncate: שם ארוך נחתך עם שלוש נקודות */}
              <span className="truncate font-semibold text-slate-700">{group.name}</span>
              {/* התפקיד: סגול למנהל, אפור לחבר */}
              <RoleBadge role={group.role} />
            </div>
          )}
        </div>

        {/* אמצע: קישורי הקבוצה, במחשב בלבד */}
        {showGroupNav && <nav className="hidden items-center gap-1 md:flex">{renderGroupLinks(false)}</nav>}

        {/* צד שמאל */}
        <div className="flex items-center gap-2">
          {/* אורח: כניסה ויצירת קבוצה */}
          {!user && (
            // fragment: שני כפתורים
            <>
              {/* כניסה */}
              <Link to="/login" className="btn-ghost">התחברות</Link>
              {/* יצירת קבוצה: הכפתור הבולט */}
              <Link to="/create-group" className="btn-primary hidden sm:inline-flex">יצירת קבוצה</Link>
            </>
          )}

          {/* משתמש עם סיסמה זמנית: רק התנתקות */}
          {user?.mustChangePassword && (
            // כפתור התנתקות
            <button type="button" onClick={handleLogout} className="btn-ghost">
              {/* סמל יציאה */}
              <Icon name="logout" />
              {/* הטקסט */}
              התנתקות
            </button>
          )}

          {/* משתמש מחובר רגיל: תפריט משתמש במחשב */}
          {user && !user.mustChangePassword && (
            // relative: התפריט הנפתח ממוקם ביחס לכפתור
            <div className="relative hidden md:block">
              {/* הכפתור: עיגול עם האות הראשונה של השם, והשם */}
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 ps-1 pe-3 text-sm font-medium text-slate-700 shadow-xs transition hover:border-slate-300"
                aria-expanded={isUserMenuOpen}
              >
                {/* העיגול עם האות הראשונה */}
                <span className="grid size-7 place-items-center rounded-full bg-teal-600 text-xs font-bold text-white">{user.name.charAt(0)}</span>
                {/* השם */}
                {user.name}
              </button>
              {/* התפריט הנפתח */}
              {isUserMenuOpen && (
                // fragment: שכבה שקופה ותפריט
                <>
                  {/* שכבה שקופה על כל המסך: לחיצה מחוץ לתפריט סוגרת אותו */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  {/* התפריט: מתחת לכפתור, מיושר לצד שמאל */}
                  <div className="absolute end-0 top-full z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {/* פרטי המשתמש בראש התפריט */}
                    <div className="mb-1 border-b border-slate-100 px-3 pt-1 pb-3">
                      {/* השם */}
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      {/* המייל */}
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    {/* הפעולות */}
                    {renderUserActions()}
                  </div>
                </>
              )}
            </div>
          )}

          {/* כפתור שלושת הקווים: בטלפון בלבד, למשתמש מחובר */}
          {user && !user.mustChangePassword && (
            // מחליף בין פתוח לסגור
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="btn-ghost relative p-2 md:hidden"
              aria-label="תפריט"
              aria-expanded={isMobileMenuOpen}
            >
              {/* איקס כשפתוח, שלושה קווים כשסגור */}
              <Icon name={isMobileMenuOpen ? "close" : "menu"} className="size-6" />
              {/* נקודה אדומה כשיש הודעות שלא נקראו והתפריט סגור */}
              {!isMobileMenuOpen && unreadCount > 0 && <span className="absolute end-1.5 top-1.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />}
            </button>
          )}
        </div>
      </div>

      {/* תפריט הטלפון: נפתח מתחת לשורה העליונה */}
      {isMobileMenuOpen && user && (
        // קו מפריד למעלה, וריווח
        <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-4 md:hidden">
          {/* פרטי המשתמש, ובתוך קבוצה גם שם הקבוצה והתפקיד */}
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {/* העיגול עם האות הראשונה */}
            <span className="grid size-10 place-items-center rounded-full bg-teal-600 font-bold text-white">{user.name.charAt(0)}</span>
            {/* השם, ומתחתיו הקבוצה */}
            <div className="min-w-0">
              {/* השם */}
              <p className="font-semibold text-slate-900">{user.name}</p>
              {/* הקבוצה והתפקיד, או המייל מחוץ לקבוצה */}
              <p className="truncate text-xs text-slate-500">{showGroupNav ? `${group.name} · ${roleNames[group.role]}` : user.email}</p>
            </div>
          </div>
          {/* קישורי הקבוצה, אחד מתחת לשני */}
          {showGroupNav && <nav className="mb-2 space-y-1 border-b border-slate-100 pb-2">{renderGroupLinks(true)}</nav>}
          {/* פעולות המשתמש */}
          <div className="space-y-0.5">{renderUserActions()}</div>
        </div>
      )}

      {/* חלון שינוי השם */}
      {isNameDialogOpen && <ChangeNameDialog onClose={() => setIsNameDialogOpen(false)} />}
    </header>
  )
}

// מייצאים את הקומפוננטה
export default Header
