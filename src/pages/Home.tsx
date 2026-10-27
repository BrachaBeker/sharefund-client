// Link: קישורים לכניסה וליצירת קבוצה
import { Link } from "react-router-dom"
// המשתמש המחובר (כדי להציג "לקבוצות שלי" במקום "כניסה")
import { useAuth } from "../context/useAuth"
// הסמלים
import Icon, { type IconName } from "../components/ui/Icon"

// היתרונות של המערכת: סמל, כותרת והסבר
const features: { icon: IconName, title: string, text: string }[] = [
  // שקיפות
  { icon: "wallet", title: "קופה שקופה", text: "כל החברים רואים כמה כסף יש בקופה וכמה הופקד, בלי לשאול ובלי לחכות לגזבר." },
  // יתרה אישית
  { icon: "users", title: "יתרה אישית לכל חבר", text: "כל הפקדה וכל הוצאה משותפת מתעדכנות ביתרה של כל אחד. רואים מיד מי בזכות ומי בחוב." },
  // היסטוריה
  { icon: "clock", title: "היסטוריה מלאה", text: "כל תנועה נשמרת עם תאריך, קטגוריה והערה, עם חיפוש וסינון. בלי פתקים ובלי טבלאות." },
  // פרטיות
  { icon: "lock", title: "פרטיות לחברים", text: "חבר רגיל רואה רק את התנועות שלו בשמו. את היתרות והמיילים של כולם רואה רק המנהל." },
]

// שלושת השלבים של "איך זה עובד"
const steps = [
  // פתיחה
  { title: "פותחים קבוצה", text: "נותנים שם לקבוצה ומוסיפים את החברים עם סיסמה זמנית." },
  // הפקדה
  { title: "מפקידים ומושכים", text: "כל חבר מפקיד בעצמו, והמנהל יכול לרשום לכמה חברים יחד." },
  // מעקב
  { title: "עוקבים בזמן אמת", text: "הקופה, היתרות וההיסטוריה מתעדכנות מיד אחרי כל פעולה." },
]

// דף הבית: הסבר קצר על המערכת, למה היא מועילה, וקישורים לכניסה ולהוספת קבוצה
function Home() {
  // המשתמש המחובר (אם יש)
  const { user } = useAuth()

  return (
    // החלקים של העמוד, עם רווח גדול ביניהם
    <div className="space-y-16 sm:space-y-24">
      {/* החלק העליון: כותרת גדולה, הסבר וכפתורים, ולידם איור של קופה */}
      <section className="grid items-center gap-10 pt-4 lg:grid-cols-2">
        {/* הטקסט */}
        <div>
          {/* תג קטן מעל הכותרת */}
          <span className="badge mb-4 bg-teal-100 px-3 py-1 text-teal-800">לוועד כיתה, לחברים, למשפחה ולצוות בעבודה</span>
          {/* הכותרת הראשית. החלק השני בצבע מעבר */}
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {/* החלק הראשון */}
            הקופה המשותפת שלכם,{" "}
            {/* החלק השני: טקסט עם מעבר צבע */}
            <span className="bg-gradient-to-l from-teal-600 to-emerald-500 bg-clip-text text-transparent">מסודרת ושקופה</span>
          </h1>
          {/* ההסבר */}
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            ShareFund מנהלת קופה של קבוצה: מי הפקיד, על מה הוצאנו, ומה היתרה של כל אחד. בלי חישובים ידניים ובלי ויכוחים.
          </p>
          {/* הכפתורים: מחובר – לקבוצות שלו. אורח – יצירת קבוצה וכניסה */}
          <div className="mt-8 flex flex-wrap gap-3">
            {/* מחובר או אורח */}
            {user ? (
              // מחובר: לקבוצות שלי
              <Link to="/select-group" className="btn-primary px-6 py-3 text-base">לקבוצות שלי</Link>
            ) : (
              // אורח: שני כפתורים
              <>
                {/* יצירת קבוצה: הכפתור הראשי */}
                <Link to="/create-group" className="btn-primary px-6 py-3 text-base"><Icon name="plus" />פותחים קבוצה בחינם</Link>
                {/* כניסה */}
                <Link to="/login" className="btn-secondary px-6 py-3 text-base">כבר יש לי חשבון</Link>
              </>
            )}
          </div>
        </div>

        {/* האיור: כרטיס שמדגים את האזור האישי (לא נתונים אמיתיים) */}
        <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
          {/* הילה צבעונית מאחורי הכרטיס. בטלפון קטנה יותר, כדי שלא תצא מרוחב המסך */}
          <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-teal-200/60 via-emerald-100/40 to-sky-200/50 blur-2xl sm:-inset-6" />
          {/* הכרטיס, מוטה קצת */}
          <div className="card relative rotate-1 p-6 shadow-2xl">
            {/* כותרת הדוגמה */}
            <div className="mb-5 flex items-center justify-between">
              {/* שם הקבוצה לדוגמה */}
              <p className="font-bold text-slate-800">קופת ועד הכיתה</p>
              {/* תג תקינה */}
              <span className="badge bg-emerald-100 text-emerald-700">תקינה</span>
            </div>
            {/* עמודת קופה קטנה ולידה הסכום */}
            <div className="flex items-end gap-6">
              {/* העמודה: מיכל עם מילוי ירוק וקו 0 */}
              <div className="relative h-44 w-16 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-inner">
                {/* המילוי */}
                <div className="absolute inset-x-0 bottom-[25%] h-[52%] bg-gradient-to-t from-emerald-600 to-teal-400" />
                {/* קו ה-0 */}
                <div className="absolute inset-x-0 bottom-[25%] h-1 bg-slate-800" />
              </div>
              {/* הסכום והיתרות */}
              <div className="flex-1 space-y-3">
                {/* יתרת הקופה */}
                <div>
                  {/* תווית */}
                  <p className="text-xs text-slate-500">יתרת הקופה</p>
                  {/* סכום */}
                  <p className="text-3xl font-extrabold text-emerald-600">1,240.00 ₪</p>
                </div>
                {/* שתי שורות של חברים לדוגמה */}
                <div className="space-y-1.5 text-sm">
                  {/* חבר בזכות */}
                  <p className="flex justify-between rounded-lg bg-slate-50 px-2 py-1"><span>נועה</span><span className="font-semibold text-emerald-600">+50.00 ₪</span></p>
                  {/* חבר בחוב */}
                  <p className="flex justify-between rounded-lg bg-slate-50 px-2 py-1"><span>איתי</span><span className="font-semibold text-rose-600">−20.00 ₪</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* היתרונות */}
      <section>
        {/* הכותרת */}
        <h2 className="mb-8 text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">למה ShareFund?</h2>
        {/* גריד של כרטיסים: אחד בטלפון, שניים בטאבלט, ארבעה במחשב */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* כרטיס לכל יתרון */}
          {features.map((feature) => (
            // הכרטיס
            <div key={feature.title} className="card transition hover:-translate-y-0.5 hover:shadow-md">
              {/* הסמל בריבוע צבעוני */}
              <span className="mb-4 grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-600"><Icon name={feature.icon} /></span>
              {/* הכותרת */}
              <h3 className="font-bold text-slate-900">{feature.title}</h3>
              {/* ההסבר */}
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* איך זה עובד */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-12 text-white sm:px-12">
        {/* הכותרת */}
        <h2 className="mb-10 text-center text-2xl font-extrabold sm:text-3xl">איך זה עובד?</h2>
        {/* שלושה שלבים */}
        <ol className="grid gap-8 sm:grid-cols-3">
          {/* שלב אחד */}
          {steps.map((step, index) => (
            // השלב
            <li key={step.title} className="text-center">
              {/* העיגול עם המספר */}
              <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-teal-500 text-lg font-extrabold">{index + 1}</span>
              {/* הכותרת */}
              <h3 className="text-lg font-bold">{step.title}</h3>
              {/* ההסבר */}
              <p className="mt-1 text-sm text-slate-300">{step.text}</p>
            </li>
          ))}
        </ol>
        {/* כפתור בסוף: רק לאורח */}
        {!user && (
          // ממורכז
          <div className="mt-10 text-center">
            {/* יצירת קבוצה */}
            <Link to="/create-group" className="btn bg-white px-6 py-3 text-base text-slate-900 hover:bg-teal-50">מתחילים עכשיו</Link>
          </div>
        )}
      </section>
    </div>
  )
}

// מייצאים את הקומפוננטה
export default Home
