// כל הנתיבים של האתר
import AppRoutes from './routes/AppRoutes'
// הכותרת העליונה
import Header from './components/Header'

// השנה הנוכחית לשורה התחתונה. מחושבת פעם אחת בטעינה, ולא בכל ציור מחדש
const YEAR = new Date().getFullYear()

// המבנה של כל עמוד: Header למעלה, התוכן באמצע, ושורה תחתונה
function App() {
  return (
    // לפחות בגובה המסך, כדי שהשורה התחתונה תהיה תמיד למטה
    <div className="flex min-h-screen flex-col">
      {/* הכותרת העליונה */}
      <Header />
      {/* התוכן: רוחב מקסימלי, ממורכז, עם ריווח מהצדדים. flex-1 ממלא את הגובה שנשאר */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {/* העמוד לפי הכתובת */}
        <AppRoutes />
      </main>
      {/* השורה התחתונה */}
      <footer className="border-t border-slate-200 bg-white/60 py-5 text-center text-xs text-slate-400">
        {/* שם האתר והשנה הנוכחית */}
        ShareFund © {YEAR} · ניהול קופה משותפת בקלות
      </footer>
    </div>
  )
}

// מייצאים את הקומפוננטה
export default App
