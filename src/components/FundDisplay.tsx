// עיצוב סכום וצבע לפי סכום
import { amountClass, formatMoney } from "../utils/format"
// הסמלים
import Icon from "./ui/Icon"

// מה הקומפוננטה מקבלת
interface FundDisplayProps {
  // יתרת הקופה (יכולה להיות שלילית)
  fundBalance: number,
  // סך כל ההפקדות מפתיחת הקבוצה
  totalDeposited: number
}

// איפה נמצא קו ה-0, באחוזים מלמעלה. מעליו מקום לקופה חיובית, ומתחתיו מקום קטן יותר לקופה שלילית
const ZERO_LINE = 72

// הקופה: עמודה לאורך עם פס מאוזן ב-0.
// קופה חיובית ממלאת את העמודה מה-0 למעלה בירוק, וקופה שלילית ממלאת מה-0 למטה באדום.
const FundDisplay = ({ fundBalance, totalDeposited }: FundDisplayProps) => {
  // האם הקופה במינוס
  const isNegative = fundBalance < 0
  // הגובה המלא של העמודה מייצג את סך ההפקדות (או את הקופה, אם היא גדולה יותר). לפחות 1, כדי לא לחלק ב-0
  const max = Math.max(totalDeposited, Math.abs(fundBalance), 1)
  // גובה המילוי הירוק, באחוזים מגובה העמודה (רק כשהקופה חיובית)
  const positiveHeight = isNegative ? 0 : (fundBalance / max) * ZERO_LINE
  // גובה המילוי האדום, באחוזים. לא יותר מהמקום שיש מתחת לקו ה-0
  const negativeHeight = isNegative ? Math.min((-fundBalance / max) * ZERO_LINE, 100 - ZERO_LINE) : 0
  // כמה אחוזים מכל ההפקדות נשארו בקופה (מעוגל למספר שלם)
  const percentLeft = totalDeposited > 0 ? Math.round((fundBalance / totalDeposited) * 100) : 0

  return (
    // הכרטיס. כשהקופה במינוס: מסגרת ורקע אדומים
    <section className={`card relative overflow-hidden ${isNegative ? "border-rose-300 bg-rose-50/60 ring-4 ring-rose-100" : ""}`}>
      {/* כותרת הכרטיס */}
      <div className="mb-4 flex items-center justify-between">
        {/* הכותרת */}
        <h2 className="text-base font-bold text-slate-700">הקופה</h2>
        {/* תג מצב: אדום ומהבהב במינוס, ירוק אחרת */}
        {isNegative
          ? <span className="badge animate-pulse bg-rose-600 text-white"><Icon name="warning" className="size-3.5" />הקופה במינוס</span>
          : <span className="badge bg-emerald-100 text-emerald-700">תקינה</span>}
      </div>

      {/* העמודה והפרטים: זה לצד זה, ובמסך צר הפרטים יורדים מתחת */}
      <div className="flex flex-wrap items-stretch gap-5">
        {/* סרגל הסכומים ליד העמודה: הסכום המלא למעלה ו-0 בקו */}
        <div className="relative h-72 w-16 shrink-0 text-[11px] font-medium text-slate-400">
          {/* הסכום המלא, בראש העמודה */}
          <span className="absolute end-0 top-0 -translate-y-1/2">{formatMoney(max)}</span>
          {/* חצי מהסכום, באמצע החלק החיובי */}
          <span className="absolute end-0 -translate-y-1/2" style={{ top: `${ZERO_LINE / 2}%` }}>{formatMoney(max / 2)}</span>
          {/* 0, בגובה הקו. מודגש */}
          <span className="absolute end-0 -translate-y-1/2 font-bold text-slate-700" style={{ top: `${ZERO_LINE}%` }}>0 ₪</span>
        </div>

        {/* העמודה עצמה: מיכל עם פינות מעוגלות */}
        <div className="relative h-72 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-slate-100 to-slate-200 shadow-[inset_0_2px_10px_rgba(15,23,42,0.12),0_10px_25px_-10px_rgba(15,23,42,0.35)]">
          {/* קווי עזר דקים כל רבע מהחלק החיובי */}
          {[0.25, 0.5, 0.75].map((part) => (
            // קו אפור מקווקו
            <div key={part} className="absolute inset-x-0 border-t border-dashed border-slate-300/80" style={{ top: `${ZERO_LINE * part}%` }} />
          ))}

          {/* המילוי הירוק: מתחיל בקו ה-0 ועולה למעלה. transition: הגובה משתנה בהנפשה רכה */}
          <div
            className="absolute inset-x-0 bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 transition-[height] duration-1000 ease-out"
            style={{ bottom: `${100 - ZERO_LINE}%`, height: `${positiveHeight}%` }}
          >
            {/* פס בהיר בראש המילוי, שנראה כמו פני נוזל */}
            {positiveHeight > 0 && <div className="absolute inset-x-0 top-0 h-1.5 bg-white/40" />}
          </div>

          {/* המילוי האדום: מתחיל בקו ה-0 ויורד למטה, עם פסים אלכסוניים */}
          <div
            className="absolute inset-x-0 bg-[repeating-linear-gradient(135deg,#e11d48_0_8px,#be123c_8px_16px)] transition-[height] duration-1000 ease-out"
            style={{ top: `${ZERO_LINE}%`, height: `${negativeHeight}%` }}
          />

          {/* קו ה-0: פס מאוזן כהה לרוחב כל העמודה */}
          <div className="absolute inset-x-0 z-10 h-1 -translate-y-1/2 bg-slate-800 shadow" style={{ top: `${ZERO_LINE}%` }} />

          {/* ברק לבן לאורך הצד, שנותן לעמודה מראה של זכוכית */}
          <div className="pointer-events-none absolute inset-y-3 start-2 w-2 rounded-full bg-white/50" />
        </div>

        {/* הפרטים: הסכום, ההסבר וסך ההפקדות */}
        <div className="flex min-w-40 flex-1 flex-col justify-center gap-4">
          {/* הסכום הגדול */}
          <div>
            {/* תווית קטנה */}
            <p className="text-xs font-medium text-slate-500">יתרת הקופה</p>
            {/* הסכום, בצבע לפי חיובי / שלילי / אפס */}
            <p className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${amountClass(fundBalance)}`}>{formatMoney(fundBalance)}</p>
          </div>
          {/* הסבר: במינוס – אזהרה, אחרת כמה אחוזים נשארו */}
          {isNegative
            ? <p className="text-sm font-medium text-rose-700">הוצאו יותר כסף ממה שהופקד. כדאי לבקש מהחברים להפקיד.</p>
            : <p className="text-sm text-slate-500">נשארו בקופה <strong className="text-slate-700">{percentLeft}%</strong> מכל ההפקדות</p>}
          {/* סך ההפקדות */}
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            {/* תווית */}
            <p className="text-xs text-slate-500">סך כל ההפקדות</p>
            {/* הסכום */}
            <p className="font-bold text-slate-800">{formatMoney(totalDeposited)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// מייצאים את הקומפוננטה
export default FundDisplay
