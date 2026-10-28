import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { getMyGroups } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import { useAuth } from "../context/useAuth"
import { amountClass, formatMoney } from "../utils/format"
import { getErrorMessage } from "../utils/errors"
import PageHeader from "../components/ui/PageHeader"
import Icon from "../components/ui/Icon"
import RoleBadge from "../components/ui/RoleBadge"
import Avatar from "../components/ui/Avatar"
import { EmptyState, ErrorState, LoadingState } from "../components/ui/PageState"

// בחירת קבוצה: כרטיס לכל קבוצה עם התפקיד והיתרה שלי
const SelectGroup = () => {
    const { user } = useAuth()
    const { data: groups, isLoading, isError, error } = useQuery({ queryKey: queryKeys.myGroups, queryFn: getMyGroups })

    if (isLoading) return <LoadingState text="טוען את הקבוצות שלך..." />
    if (isError) return <ErrorState title="לא ניתן לטעון את הקבוצות" text={getErrorMessage(error)} />

    const createLink = <Link to="/create-group" className="btn-primary"><Icon name="plus" className="size-4" />קבוצה חדשה</Link>

    return (
        <>
            <PageHeader title={`שלום, ${user?.name ?? ""}`} subtitle="בחרו קבוצה כדי להמשיך" actions={createLink} />

            {!groups?.length && <EmptyState title="עוד אין לך קבוצות" text="פותחים קבוצה חדשה ומוסיפים אליה חברים, או מבקשים ממנהל של קבוצה להוסיף אתכם." icon="users" action={createLink} />}

            {!!groups?.length && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <li key={group.id}>
                            <Link
                                to={`/group/${group.id}/dashboard`}
                                className={`card flex h-full flex-col gap-4 transition hover:border-brand-300 hover:shadow-sm ${group.isActive ? "" : "bg-slate-50"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar name={group.name} className="size-10 bg-slate-100 text-slate-600" />
                                    <h2 className="min-w-0 flex-1 truncate font-semibold text-slate-900">{group.name}</h2>
                                    <Icon name="chevronLeft" className="size-4 text-slate-400" />
                                </div>
                                <div className="flex gap-1.5">
                                    <RoleBadge role={group.role} />
                                    {!group.isActive && <span className="badge bg-slate-200 text-slate-600"><Icon name="lock" className="size-3" />סגורה</span>}
                                </div>
                                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                                    <span className="text-sm text-slate-500">היתרה שלי</span>
                                    <span className={`font-semibold tabular-nums ${amountClass(group.myBalance)}`}>{formatMoney(group.myBalance)}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export default SelectGroup
