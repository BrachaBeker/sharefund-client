import { useQuery } from "@tanstack/react-query"
import { Link, Outlet, useLocation, useParams } from "react-router-dom"
import { getMyGroup } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import { getErrorMessage } from "../utils/errors"
import { ErrorState, LoadingState } from "../components/ui/PageState"
import type { CurrentGroup } from "../hooks/useCurrentGroup"

const GroupLayout = () => {
    const groupId = Number(useParams().id)
    const { pathname } = useLocation()
    const isValidId = Number.isInteger(groupId) && groupId > 0

    const { data: group, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.group(groupId),
        queryFn: () => getMyGroup(groupId),
        enabled: isValidId,
    })

    const backToGroups = <Link to="/select-group" className="btn-secondary">חזרה לקבוצות שלי</Link>

    if (!isValidId) return <ErrorState title="הכתובת אינה תקינה" text="לא נמצאה קבוצה בכתובת הזאת." action={backToGroups} />
    if (isLoading) return <LoadingState text="טוען את הקבוצה..." />
    if (isError || !group) return <ErrorState title="לא ניתן לפתוח את הקבוצה" text={getErrorMessage(error)} action={backToGroups} />

    return (
        <div key={pathname} className="page-enter">
            <Outlet context={{ groupId, group } satisfies CurrentGroup} />
        </div>
    )
}

export default GroupLayout
