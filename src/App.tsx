import { useLocation } from "react-router-dom"
import AppRoutes from "./routes/AppRoutes"
import Header from "./components/Header"
import LogoMark from "./components/ui/LogoMark"
import Icon from "./components/ui/Icon"
import { useScrolled } from "./hooks/useScrolled"

// המבנה של כל עמוד: Header למעלה, התוכן באמצע, שורה תחתונה וכפתור חזרה למעלה
const App = () => {
    const showBackToTop = useScrolled(600)
    // עמודי קבוצה מקבלים את המעבר ב-GroupLayout, כדי שהקבוצה לא תיטען מחדש בכל לשונית
    const { pathname } = useLocation()
    const pageKey = pathname.startsWith("/group/") ? pathname.split("/").slice(0, 3).join("/") : pathname

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
                <div key={pageKey} className="page-enter">
                    <AppRoutes />
                </div>
            </main>
            <footer className="mt-10 bg-ink text-sm text-white/70">
                <div className="h-1 bg-linear-to-l from-brand-500 via-fuchsia-500 to-accent-400" />
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6">
                    <span className="flex items-center gap-2">
                        <LogoMark />
                        <span className="text-lg font-extrabold text-white">ShareFund</span>
                    </span>
                    <p>ShareFund · ניהול קופה משותפת בקלות · כל הזכויות שמורות לברכי בקר ©</p>
                </div>
            </footer>

            {/* כפתור חזרה למעלה, מופיע אחרי גלילה ארוכה */}
            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0 })}
                className={`fixed bottom-5 left-5 z-30 grid size-12 cursor-pointer place-items-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/40 transition duration-300 hover:bg-brand-700 motion-safe:hover:-translate-y-1 ${showBackToTop ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
                aria-label="חזרה לראש העמוד"
                tabIndex={showBackToTop ? 0 : -1}
            >
                <Icon name="arrowUp" className="size-5" />
            </button>
        </div>
    )
}

export default App
