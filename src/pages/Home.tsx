import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import Icon, { type IconName } from "../components/ui/Icon"
import FundDisplay from "../components/FundDisplay"

const features: { icon: IconName, title: string, text: string }[] = [
    { icon: "wallet", title: "קופה שקופה", text: "כל החברים רואים כמה כסף יש בקופה וכמה הופקד, בלי לשאול ובלי לחכות לגזבר." },
    { icon: "users", title: "יתרה אישית לכל חבר", text: "כל הפקדה וכל הוצאה משותפת מתעדכנות ביתרה של כל אחד. רואים מיד מי בזכות ומי בחוב." },
    { icon: "clock", title: "היסטוריה מלאה", text: "כל תנועה נשמרת עם תאריך, קטגוריה והערה, עם חיפוש וסינון. בלי פתקים ובלי טבלאות." },
    { icon: "lock", title: "פרטיות לחברים", text: "חבר רגיל רואה רק את התנועות שלו בשמו. את היתרות והמיילים של כולם רואה רק המנהל." },
]

const steps = [
    { title: "פותחים קבוצה", text: "נותנים שם לקבוצה ומוסיפים את החברים עם סיסמה זמנית." },
    { title: "מפקידים ומושכים", text: "כל חבר מפקיד בעצמו, והמנהל יכול לרשום לכמה חברים יחד." },
    { title: "עוקבים בזמן אמת", text: "הקופה, היתרות וההיסטוריה מתעדכנות מיד אחרי כל פעולה." },
]

// דף הבית: הסבר קצר על המערכת, דוגמה של הקופה, וקישורים לכניסה וליצירת קבוצה
const Home = () => {
    const { user } = useAuth()

    return (
        <div className="space-y-16 sm:space-y-20">
            <section className="grid items-center gap-10 pt-2 lg:grid-cols-2">
                <div>
                    <p className="mb-3 text-sm font-semibold text-brand-700">לוועד כיתה, לחברים, למשפחה ולצוות בעבודה</p>
                    <h1 className="text-4xl leading-tight font-bold text-slate-900 sm:text-5xl">
                        הקופה המשותפת שלכם, מסודרת ושקופה
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                        ShareFund מנהלת קופה של קבוצה: מי הפקיד, על מה הוצאנו, ומה היתרה של כל אחד. בלי חישובים ידניים ובלי ויכוחים.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        {user ? (
                            <Link to="/select-group" className="btn-primary px-5 py-2.5">לקבוצות שלי</Link>
                        ) : (
                            <>
                                <Link to="/create-group" className="btn-primary px-5 py-2.5">פותחים קבוצה בחינם</Link>
                                <Link to="/login" className="btn-secondary px-5 py-2.5">כבר יש לי חשבון</Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="pointer-events-none select-none" aria-hidden="true">
                    <FundDisplay fundBalance={1240} totalDeposited={2000} />
                </div>
            </section>

            <section>
                <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">למה ShareFund?</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div key={feature.title} className="card">
                            <span className="mb-4 grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon name={feature.icon} /></span>
                            <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="card px-6 py-10 sm:px-10">
                <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">איך זה עובד?</h2>
                <ol className="grid gap-8 sm:grid-cols-3">
                    {steps.map((step, index) => (
                        <li key={step.title} className="text-center">
                            <span className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-brand-600 font-semibold text-white">{index + 1}</span>
                            <h3 className="font-semibold text-slate-900">{step.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{step.text}</p>
                        </li>
                    ))}
                </ol>
                {!user && (
                    <div className="mt-10 text-center">
                        <Link to="/create-group" className="btn-primary px-5 py-2.5">מתחילים עכשיו</Link>
                    </div>
                )}
            </section>
        </div>
    )
}

export default Home
