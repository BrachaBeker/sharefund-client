import { useState } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { useCountUp } from "../hooks/useCountUp"
import { useUnreadCount } from "../hooks/useUnreadCount"
import { roleNames } from "../utils/labels"
import { formatMoney } from "../utils/format"
import FundDisplay from "../components/FundDisplay"
import TransactionForm from "../components/TransactionForm"
import GroupActions from "../components/GroupActions"
import PageHeader from "../components/ui/PageHeader"
import ColorTile from "../components/ui/ColorTile"
import Alert from "../components/ui/Alert"
import Reveal from "../components/ui/Reveal"

// התאריך של היום וברכה לפי השעה. מחושב פעם אחת כשהעמוד נפתח
const getToday = () => {
    const now = new Date()
    const hour = now.getHours()
    const greeting = hour >= 5 && hour < 12 ? "בוקר טוב" : hour >= 12 && hour < 17 ? "צהריים טובים" : hour >= 17 && hour < 22 ? "ערב טוב" : "לילה טוב"
    return { greeting, date: now.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }) }
}

// האזור האישי: הקופה, אריחים עם הנתונים שלי, הפקדה ומשיכה
const Dashboard = () => {
    const { user } = useAuth()
    const { groupId, group } = useCurrentGroup()
    const notice = (useLocation().state as { notice?: string } | null)?.notice
    const unreadCount = useUnreadCount(groupId)
    const balance = group.myBalance
    const shownBalance = useCountUp(balance)
    const [today] = useState(getToday)

    return (
        <>
            <PageHeader
                eyebrow={today.date}
                title={`${today.greeting}, ${user?.name ?? ""}`}
                subtitle={`${group.name} · ${roleNames[group.role]} בקבוצה`}
            />

            {notice && <Alert variant="info" className="mb-6">{notice}</Alert>}

            {!group.isActive && (
                <Alert variant="warning" className="mb-6">
                    <strong>הקבוצה סגורה</strong> – אפשר לצפות בנתונים, אבל אי אפשר לבצע פעולות.
                </Alert>
            )}

            <div className="grid gap-5 lg:grid-cols-5">
                <Reveal className="lg:col-span-3">
                    <FundDisplay fundBalance={group.fundBalance} totalDeposited={group.totalDeposited} />
                </Reveal>

                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                    <Reveal delay={80}>
                        <ColorTile
                            tone="blue"
                            icon="wallet"
                            label="היתרה שלי"
                            value={formatMoney(shownBalance)}
                            hint={balance > 0 ? "יש לך יתרה בקופה" : balance < 0 ? "יש לך חוב לקופה" : "היתרה שלך מאופסת"}
                        />
                    </Reveal>
                    <Reveal delay={160}>
                        <ColorTile
                            tone="orange"
                            icon="mail"
                            label="הודעות חדשות"
                            value={String(unreadCount)}
                            hint={unreadCount ? "לחצו כדי לקרוא" : "אין הודעות חדשות"}
                            to={`/group/${groupId}/messages`}
                        />
                    </Reveal>
                    <Reveal delay={240}>
                        <ColorTile
                            tone="green"
                            icon="users"
                            label="חברים"
                            value={String(group.membersCount)}
                            hint={`מנהל: ${group.managerName}`}
                            to={`/group/${groupId}/members`}
                        />
                    </Reveal>
                    <Reveal delay={320}>
                        <ColorTile
                            tone="purple"
                            icon="clock"
                            label="היסטוריה"
                            value="כל התנועות"
                            hint="חיפוש, סינון ומיון"
                            to={`/group/${groupId}/history`}
                        />
                    </Reveal>
                </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
                היתרה שלך עולה בכל הפקדה שלך, ויורדת במשיכה אישית ובחלק שלך מכל הוצאה משותפת.
            </p>

            {group.isActive && (
                <div className="mt-8 space-y-6">
                    <Reveal><TransactionForm groupId={groupId} /></Reveal>
                    <Reveal><GroupActions groupId={groupId} role={group.role} myBalance={group.myBalance} /></Reveal>
                </div>
            )}
        </>
    )
}

export default Dashboard
