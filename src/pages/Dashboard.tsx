import { useLocation } from "react-router-dom"
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { roleNames } from "../utils/labels"
import { amountClass, formatMoney } from "../utils/format"
import FundDisplay from "../components/FundDisplay"
import TransactionForm from "../components/TransactionForm"
import GroupActions from "../components/GroupActions"
import PageHeader from "../components/ui/PageHeader"
import CardTitle from "../components/ui/CardTitle"
import Alert from "../components/ui/Alert"

// האזור האישי: הקופה, היתרה שלי, הפקדה ומשיכה
const Dashboard = () => {
    const { groupId, group } = useCurrentGroup()
    const notice = (useLocation().state as { notice?: string } | null)?.notice
    const balance = group.myBalance

    return (
        <>
            <PageHeader
                title={group.name}
                subtitle={`${roleNames[group.role]} בקבוצה · מנהל: ${group.managerName} · ${group.membersCount} חברים`}
            />

            {notice && <Alert variant="info" className="mb-6">{notice}</Alert>}

            {!group.isActive && (
                <Alert variant="warning" className="mb-6">
                    <strong>הקבוצה סגורה</strong> – אפשר לצפות בנתונים, אבל אי אפשר לבצע פעולות.
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <FundDisplay fundBalance={group.fundBalance} totalDeposited={group.totalDeposited} />
                </div>

                <section className="card flex flex-col">
                    <CardTitle title="היתרה שלי" />
                    <p className={`text-3xl font-bold tabular-nums ${amountClass(balance)}`}>{formatMoney(balance)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                        {balance > 0 && "יש לך יתרה בקופה"}
                        {balance < 0 && `יש לך חוב בסך ${formatMoney(-balance)}`}
                        {balance === 0 && "היתרה שלך מאופסת"}
                    </p>
                    <p className="mt-auto border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
                        היתרה עולה בכל הפקדה שלך, ויורדת במשיכה אישית ובחלק שלך מכל הוצאה משותפת.
                    </p>
                </section>
            </div>

            {group.isActive && (
                <div className="mt-6 space-y-6">
                    <TransactionForm groupId={groupId} />
                    <GroupActions groupId={groupId} role={group.role} myBalance={group.myBalance} />
                </div>
            )}
        </>
    )
}

export default Dashboard
