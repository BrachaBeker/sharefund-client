import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { getMyGroups } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import { useAuth } from "../context/useAuth"
import { amountClass, formatMoney } from "../utils/format"
import { getErrorMessage } from "../utils/errors"
import { gradients } from "../utils/colors"
import PageHeader from "../components/ui/PageHeader"
import Icon from "../components/ui/Icon"
import RoleBadge from "../components/ui/RoleBadge"
import Avatar from "../components/ui/Avatar"
import Reveal from "../components/ui/Reveal"
import { trackPointer } from "../utils/spotlight"
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
                    {groups.map((group, index) => (
                        <li key={group.id}>
                            <Reveal delay={index * 80} className="h-full">
                                <Link
                                    to={`/group/${group.id}/dashboard`}
                                    onPointerMove={trackPointer}
                                    className={`card card-link spotlight group flex h-full flex-col gap-4 ${group.isActive ? "" : "bg-slate-50"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar name={group.name} className={`size-12 rounded-2xl bg-linear-to-br text-lg text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:-rotate-6 ${gradients[index % gradients.length]}`} />
                                        <h2 className="min-w-0 flex-1 truncate text-lg font-bold">{group.name}</h2>
                                        <Icon name="chevronLeft" className="size-4 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-brand-600" />
                                    </div>
                                    <div className="flex gap-1.5">
                                        <RoleBadge role={group.role} />
                                        {!group.isActive && <span className="badge bg-slate-200 text-slate-600"><Icon name="lock" className="size-3" />סגורה</span>}
                                    </div>
                                    <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                                        <span className="text-sm text-slate-500">היתרה שלי</span>
                                        <span className={`text-xl font-bold tabular-nums ${amountClass(group.myBalance)}`}>{formatMoney(group.myBalance)}</span>
                                    </div>
                                </Link>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export default SelectGroup
