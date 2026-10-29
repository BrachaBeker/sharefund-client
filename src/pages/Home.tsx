import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import FundDisplay from "../components/FundDisplay"
// עיצוב – לא לוגיקה
import Icon, { type IconName } from "../design/Icon"
import Reveal from "../design/Reveal"
import { trackPointer } from "../design/spotlight"

const highlights = ["בלי חישובים ידניים ובלי ויכוחים", "כל חבר רואה את היתרה שלו", "חינם, פותחים קבוצה בדקה"]

const features: { icon: IconName, title: string, text: string, tone: string }[] = [
    { icon: "wallet", title: "קופה שקופה", text: "כל החברים רואים כמה כסף יש בקופה וכמה הופקד, בלי לשאול ובלי לחכות לגזבר.", tone: "bg-brand-100 text-brand-600" },
    { icon: "users", title: "יתרה אישית לכל חבר", text: "כל הפקדה וכל הוצאה משותפת מתעדכנות ביתרה של כל אחד. רואים מיד מי בזכות ומי בחוב.", tone: "bg-accent-100 text-accent-600" },
    { icon: "clock", title: "היסטוריה מלאה", text: "כל תנועה נשמרת עם תאריך, קטגוריה והערה, עם חיפוש וסינון. בלי פתקים ובלי טבלאות.", tone: "bg-emerald-100 text-emerald-600" },
    { icon: "lock", title: "פרטיות לחברים", text: "חבר רגיל רואה רק את התנועות שלו בשמו. את היתרות והמיילים של כולם רואה רק המנהל.", tone: "bg-pink-100 text-pink-600" },
]

const steps: { title: string, text: string, icon: IconName, bubble: string, place: string }[] = [
    { title: "פותחים קבוצה", text: "נותנים שם לקבוצה ומוסיפים את החברים עם סיסמה זמנית.", icon: "plus", bubble: "from-brand-400 to-brand-600", place: "lg:col-start-1 lg:row-start-1 lg:justify-self-start" },
    { title: "מפקידים ומושכים", text: "כל חבר מפקיד בעצמו, והמנהל יכול לרשום לכמה חברים יחד.", icon: "wallet", bubble: "from-amber-400 to-accent-500", place: "lg:col-start-2 lg:row-start-2 lg:justify-self-end" },
    { title: "עוקבים בזמן אמת", text: "הקופה, היתרות וההיסטוריה מתעדכנות מיד אחרי כל פעולה.", icon: "check", bubble: "from-emerald-400 to-teal-600", place: "lg:col-start-1 lg:row-start-3 lg:justify-self-start" },
]

// עיצוב – לא לוגיקה
const bubbles: { icon: IconName, className: string }[] = [
    { icon: "users", className: "-top-7 left-10 bg-sky-500 [animation-delay:-1s]" },
    { icon: "arrowDown", className: "top-[42%] -left-2 sm:-left-7 bg-accent-400 [animation-delay:-3s]" },
    { icon: "check", className: "-bottom-7 left-10 bg-emerald-500 [animation-delay:-4.5s]" },
]

const Home = () => {
    const { user } = useAuth()
    const startLink = user
        ? <Link to="/select-group" className="btn-primary px-7 py-3.5 text-base">לקבוצות שלי<Icon name="chevronLeft" className="size-4" /></Link>
        : <Link to="/create-group" className="btn-primary px-7 py-3.5 text-base">פותחים קבוצה בחינם<Icon name="chevronLeft" className="size-4" /></Link>

    return (
        <div className="space-y-24 overflow-x-clip sm:space-y-32">
            <section className="grid items-center gap-14 pt-4 lg:grid-cols-2 lg:pt-10">
                <div>
                    <p className="rise-in mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-ink shadow-sm">
                        <span className="size-2 animate-pulse rounded-full bg-accent-400" />
                        לוועד כיתה, לחברים, למשפחה ולצוות בעבודה
                    </p>
                    <h1 className="rise-in text-4xl leading-[1.15] font-extrabold tracking-tight [animation-delay:100ms] sm:text-6xl">
                        הקופה המשותפת
                        <span className="block text-brand-600">פשוט ושקוף</span>
                    </h1>
                    <p className="rise-in mt-6 max-w-lg text-lg leading-relaxed text-slate-600 [animation-delay:200ms]">
                        ShareFund מנהלת קופה של קבוצה: מי הפקיד, על מה הוצאנו, ומה היתרה של כל אחד.
                    </p>
                    <ul className="rise-in mt-6 space-y-3 [animation-delay:250ms]">
                        {highlights.map((text) => (
                            <li key={text} className="flex items-center gap-3 text-ink">
                                <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Icon name="check" className="size-3.5" /></span>
                                {text}
                            </li>
                        ))}
                    </ul>
                    <div className="rise-in mt-10 flex flex-wrap items-center gap-6 [animation-delay:300ms]">
                        {startLink}
                        {!user && <Link to="/login" className="link">כבר יש לי חשבון</Link>}
                        <a href="#how" className="link">איך זה עובד?</a>
                    </div>
                </div>

                {/* עיצוב – לא לוגיקה */}
                <div className="rise-in relative isolate mx-auto w-full max-w-md select-none [animation-delay:250ms]" aria-hidden="true">
                    <div className="absolute -inset-x-10 -inset-y-8 -z-10 rounded-[46%_54%_42%_58%/55%_45%_55%_45%] bg-brand-100/80" />
                    <div className="absolute -bottom-14 -left-8 -z-10 size-44 rounded-full bg-emerald-100" />

                    <div className="pointer-events-none float">
                        <FundDisplay fundBalance={1240} totalDeposited={2000} />
                    </div>

                    {bubbles.map((bubble) => (
                        <span key={bubble.icon} className={`float absolute grid size-14 place-items-center rounded-full text-white shadow-xl ring-4 ring-white ${bubble.className}`}>
                            <Icon name={bubble.icon} />
                        </span>
                    ))}

                    <div className="float absolute -bottom-10 right-6 flex items-center gap-3 rounded-2xl bg-white py-3 ps-3 pe-5 shadow-xl shadow-brand-900/15 [animation-delay:-2s]">
                        <span className="grid size-10 place-items-center rounded-full bg-emerald-500 text-white"><Icon name="arrowDown" className="size-5" /></span>
                        <div>
                            <p className="text-xs text-slate-500">קופת ועד הכיתה · עכשיו</p>
                            <p className="text-sm font-semibold text-ink">נועה הפקידה 50 ₪</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* עיצוב – לא לוגיקה */}
            <section className="rounded-[2.5rem] bg-linear-to-br from-brand-100/70 via-white to-accent-100/70 px-5 py-14 sm:px-10">
                <Reveal className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">מה יש בפנים?</h2>
                    <p className="mt-3 text-slate-500">כל מה שצריך כדי לנהל כסף משותף, בלי אקסל ובלי גזבר</p>
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Reveal key={feature.title} delay={index * 100} className="h-full">
                            <div onPointerMove={trackPointer} className="card card-link spotlight group h-full">
                                <span className={`mb-5 grid size-14 place-items-center rounded-2xl transition duration-300 group-hover:scale-110 group-hover:-rotate-6 ${feature.tone}`}><Icon name={feature.icon} className="size-7" /></span>
                                <h3 className="text-lg font-bold">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section id="how">
                <Reveal className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">איך זה עובד?</h2>
                    <p className="mt-3 text-slate-500">שלושה צעדים, וכולם בתמונה</p>
                </Reveal>

                <div className="relative isolate grid gap-12 lg:grid-cols-2 lg:gap-y-6">
                    {/* עיצוב – לא לוגיקה */}
                    <Reveal effect="draw" className="absolute inset-0 -z-10 hidden lg:block">
                        <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            <path d="M 70 16 H 22 V 45" className="dash-flow" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="7 7" vectorEffect="non-scaling-stroke" />
                            <path d="M 22 55 V 84 H 70" className="dash-flow" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="7 7" vectorEffect="non-scaling-stroke" />
                        </svg>
                    </Reveal>

                    {steps.map((step, index) => (
                        <Reveal key={step.title} delay={index * 150} className={`w-full lg:w-[78%] ${step.place}`}>
                            <div className="card card-link relative">
                                <span className={`float absolute -top-6 left-6 grid size-14 place-items-center rounded-2xl bg-linear-to-br text-white shadow-xl ${step.bubble}`} style={{ animationDelay: `${index * -1.5}s` }}>
                                    <Icon name={step.icon} className="size-7" />
                                </span>
                                <div className="flex items-end gap-4">
                                    <span className="text-6xl leading-none font-light text-ink tabular-nums sm:text-7xl">0{index + 1}</span>
                                    <h3 className="pb-1 text-lg font-bold">{step.title}</h3>
                                </div>
                                <p className="mt-4 text-accent-600">{step.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* עיצוב – לא לוגיקה */}
            <Reveal>
                <section className="relative isolate px-6 py-20 text-center text-white sm:px-12">
                    <div className="absolute inset-0 -z-10 skew-y-0 overflow-hidden rounded-[2.5rem] bg-ink transition-transform delay-300 duration-1000 ease-out in-[.is-visible]:-skew-y-2" aria-hidden="true">
                        <span className="blob-drift absolute -top-16 -right-16 size-72 rounded-full bg-brand-500/45 blur-2xl" />
                        <span className="blob-drift absolute -bottom-24 -left-10 size-72 rounded-full bg-accent-500/35 blur-2xl [animation-delay:-4s]" />
                        <span className="blob-drift absolute top-1/3 left-1/2 size-40 rounded-full bg-fuchsia-500/25 blur-2xl [animation-delay:-7s]" />
                    </div>
                    {["top-10 left-[12%]", "bottom-12 right-[14%] [animation-delay:-2s]", "bottom-10 left-[24%] [animation-delay:-4s]"].map((place) => (
                        <span key={place} className={`float absolute hidden size-12 place-items-center rounded-full bg-amber-300 font-bold text-amber-800 shadow-lg ring-4 ring-amber-200/60 sm:grid ${place}`} aria-hidden="true">₪</span>
                    ))}
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">בואו נתחיל!</h2>
                    <p className="mx-auto mt-3 max-w-md text-white/80">פותחים קבוצה, מוסיפים חברים, ומתחילים לנהל את הקופה ביחד.</p>
                    <Link to={user ? "/select-group" : "/create-group"} className="btn-accent mt-8 px-7 py-3.5 text-base">
                        {user ? "לקבוצות שלי" : "פותחים קבוצה בחינם"}<Icon name="chevronLeft" className="size-4" />
                    </Link>
                </section>
            </Reveal>
        </div>
    )
}

export default Home
