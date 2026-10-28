import AppRoutes from "./routes/AppRoutes"
import Header from "./components/Header"

// המבנה של כל עמוד: Header למעלה, התוכן באמצע, ושורה תחתונה
const App = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
                <AppRoutes />
            </main>
            <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
                ShareFund · ניהול קופה משותפת בקלות · כל הזכויות שמורות לברכי בקר ©
            </footer>
        </div>
    )
}

export default App
